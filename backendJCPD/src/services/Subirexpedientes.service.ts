import { Expediente } from '../models/expedientes.models';
import { supabase } from '../config/supabase';
import fs from 'fs-extra';
import path from 'path';
import { sanitizarRuta } from '../utils/sanitizar rutas';
import { RegistrarLoggs } from './loggs.service';



// Servicio para guardar expediente subido
// Espera req.file (de multer) y body con idDenuncia y tipoExpediente
export async function guardarExpediente({ file, idDenuncia, tipoExpediente, codigoTramite }: {
  file: Express.Multer.File,
  idDenuncia: number,
  tipoExpediente: string,
  codigoTramite:string
},idUsuario:number,usuario:string,nombres:string,canton:string) {
  // 1. Validaciones preventivas para evitar crashes
  if (!file) throw new Error('Archivo requerido');
  if (!idDenuncia) throw new Error('idDenuncia requerido');
  if (!tipoExpediente) throw new Error('tipoExpediente requerido');

  // 2. Generamos manualmente el nombre y la ruta (Sustituimos lo que hacía Multer Disk)
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
  const nombreGenerado = `${uniqueSuffix}-${file.originalname}`;
  const rutaRelativa =sanitizarRuta(`${codigoTramite}/${tipoExpediente}/${nombreGenerado}`) ;
  

 
  
  let pathParaDB = '';

  // 

  // 3. Lógica de Almacenamiento
  if (process.env.STORAGE_TYPE === 'cloud') {
    // --- MODO NUBE (SUPABASE) ---
    const { data, error } = await supabase!.storage
      .from('expedientes')
      .upload(rutaRelativa, file.buffer, { // Usamos el buffer de memoria
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Obtenemos la URL de internet
    const { data: { publicUrl } } = supabase!.storage.from('expedientes').getPublicUrl(data.path);
    pathParaDB = publicUrl;

  } else {
    // --- MODO INTRANET (LOCAL) ---
    const baseDir = path.resolve('uploads', `${codigoTramite}`, tipoExpediente);
    const fullPath = path.join(baseDir, nombreGenerado);

    // Creamos las carpetas físicas en el servidor local
    await fs.ensureDir(baseDir);
    await fs.writeFile(fullPath, file.buffer);
    
    // Guardamos la ruta que Express usará para servir el archivo
    pathParaDB = `/uploads/${rutaRelativa}`;
  }

  // 4. Guardado en Sequelize (Igual que antes, pero con los nuevos valores)
  const expediente = await Expediente.create({
    idDenuncia,
    pathExpediente: pathParaDB,  // Reemplaza a file.path
    filename: nombreGenerado,    // Reemplaza a file.filename
    tipoExpediente
  });
  RegistrarLoggs({
                        idUsuario: idUsuario,
                        usuario:usuario ,
                        nombres: nombres,
                        fase:'expedientes',
                        accion:'UPLOAD' ,
                        descripcion:` ${usuario} acaba de subir un archivo de ${tipoExpediente}  relacionado al  codigo de expediente ${codigoTramite}` ,
                        canton:canton
                        
                        });

  return expediente;
}

// Obtener expedientes por idDenuncia
export async function obtenerExpedientesPorDenuncia(idDenuncia: number) {
  return await Expediente.findAll({
    where: { idDenuncia }
  });
}


export async function actualizarExpediente({ idExpediente, file, idDenuncia, tipoExpediente,codigoTramite }: {
  idExpediente: number,
  file?: Express.Multer.File,
  idDenuncia?: number,
  tipoExpediente?: string
  codigoTramite: string
},idUsuario:number,usuario:string,nombres:string,canton:string) {
  try {
    const updateData: any = {};
    const storageType = process.env.STORAGE_TYPE || 'local'; 

    // 1. Buscamos el expediente PRIMERO. Lo necesitamos sí o sí para obtener 
    // su código de trámite y saber dónde guardar el nuevo archivo.
    const expedienteAnterior = await Expediente.findByPk(idExpediente);
    if (!expedienteAnterior) {
      throw new Error('Expediente no encontrado');
    }

    if (file) {
      // ==========================================
      // FASE A: ELIMINAR EL ARCHIVO ANTERIOR
      // ==========================================
      if (expedienteAnterior.pathExpediente) {
        try {
          if (storageType === 'local') {
            // Convertimos la ruta web ("/uploads/...") a ruta física ("uploads/...")
            const physicalPath = path.join(process.cwd(), expedienteAnterior.pathExpediente);
            if (fs.existsSync(physicalPath)) {
              fs.unlinkSync(physicalPath);
            }
          } 
          else if (storageType === 'cloud') {
            // Extraemos la ruta relativa de la URL pública de Supabase
            // Ejemplo: Pasa de "https://tu-proyecto.supabase.co/storage/v1/object/public/expedientes/tramite/tipo/archivo.pdf"
            // a simplemente "tramite/tipo/archivo.pdf"
            const urlParts = expedienteAnterior.pathExpediente.split('/expedientes/');
            if (urlParts.length > 1) {
              const rutaRelativaBucket = urlParts[1];
              const { error } = await supabase!.storage
                .from('expedientes')
                .remove([rutaRelativaBucket]);

              if (error) throw error;
            }
          }
        } catch (err) {
          console.error(`No se pudo eliminar el archivo anterior en modo ${storageType}:`, err);
        }
      }

      // ==========================================
      // FASE B: SUBIR EL NUEVO ARCHIVO (con memoryStorage)
      // ==========================================
      // Obtenemos el tipo y código actual (o el nuevo si lo están cambiando en la petición)
      const tipoParaRuta = tipoExpediente || expedienteAnterior.tipoExpediente;
       // Asumo que tienes esto en tu modelo

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
      const nombreGenerado = `${uniqueSuffix}-${file.originalname}`;
      const rutaRelativa = sanitizarRuta(`${codigoTramite}/${tipoParaRuta}/${nombreGenerado}`);
      
      let pathParaDB = '';

      if (storageType === 'cloud') {
        const { data, error } = await supabase!.storage
          .from('expedientes')
          .upload(rutaRelativa, file.buffer, { // <-- Usamos el buffer en RAM
            contentType: file.mimetype,
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase!.storage.from('expedientes').getPublicUrl(data.path);
        pathParaDB = publicUrl;

      } else {
        const baseDir = path.resolve('uploads', String(codigoTramite), tipoParaRuta);
        const fullPath = path.join(baseDir, nombreGenerado);

        await fs.ensureDir(baseDir);
        await fs.writeFile(fullPath, file.buffer); // <-- Escribimos desde la RAM al disco
        
        const rutaWeb = rutaRelativa.replace(/\\/g, '/');
        pathParaDB = `/uploads/${rutaWeb}`;
      }

      // 3. Preparamos los datos del archivo para Sequelize
      updateData.filename = nombreGenerado;
      updateData.pathExpediente = pathParaDB; 
    }

    // ==========================================
    // FASE C: ACTUALIZAR BASE DE DATOS
    // ==========================================
    if (idDenuncia !== undefined) updateData.idDenuncia = idDenuncia;
    if (tipoExpediente !== undefined) updateData.tipoExpediente = tipoExpediente;

    // En lugar de hacer update y luego findByPk, podemos actualizar la instancia directamente
    await expedienteAnterior.update(updateData);
    RegistrarLoggs({
                        idUsuario: idUsuario,
                        usuario:usuario ,
                        nombres: nombres,
                        fase:'expedientes',
                        accion:'UPDATE' ,
                        descripcion:` ${usuario} acaba de editar la subida de un archivo de ${tipoExpediente}  relacionado al  codigo de expediente ${codigoTramite}` ,
                        canton:canton
                        
                        });

    return expedienteAnterior;
  } catch (error) {
    throw error;
  }
}






