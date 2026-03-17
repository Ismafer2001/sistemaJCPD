import { Expediente } from '../models/expedientes.models';
import { supabase } from '../config/supabase';
import fs from 'fs-extra';
import path from 'path';



// Servicio para guardar expediente subido
// Espera req.file (de multer) y body con idDenuncia y tipoExpediente
export async function guardarExpediente({ file, idDenuncia, tipoExpediente }: {
  file: Express.Multer.File,
  idDenuncia: number,
  tipoExpediente: string
}) {
  // 1. Validaciones preventivas para evitar crashes
  if (!file) throw new Error('Archivo requerido');
  if (!idDenuncia) throw new Error('idDenuncia requerido');
  if (!tipoExpediente) throw new Error('tipoExpediente requerido');

  // 2. Generamos manualmente el nombre y la ruta (Sustituimos lo que hacía Multer Disk)
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
  const nombreGenerado = `${uniqueSuffix}-${file.originalname}`;
  const rutaRelativa = `denuncia-${idDenuncia}/${tipoExpediente}/${nombreGenerado}`;
  
  let pathParaDB = '';

  // 

  // 3. Lógica de Almacenamiento
  if (process.env.STORAGE_TYPE === 'cloud') {
    // --- MODO NUBE (SUPABASE) ---
    const { data, error } = await supabase.storage
      .from('expedientes')
      .upload(rutaRelativa, file.buffer, { // Usamos el buffer de memoria
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Obtenemos la URL de internet
    const { data: { publicUrl } } = supabase.storage.from('expedientes').getPublicUrl(data.path);
    pathParaDB = publicUrl;

  } else {
    // --- MODO INTRANET (LOCAL) ---
    const baseDir = path.resolve('uploads', `denuncia-${idDenuncia}`, tipoExpediente);
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

  return expediente;
}

// Obtener expedientes por idDenuncia
export async function obtenerExpedientesPorDenuncia(idDenuncia: number) {
  return await Expediente.findAll({
    where: { idDenuncia }
  });
}








// Actualizar expediente existente
export async function actualizarExpediente({ idExpediente, file, idDenuncia, tipoExpediente }: {
  idExpediente: number,
  file?: Express.Multer.File,
  idDenuncia?: number,
  tipoExpediente?: string
}) {
  try {
    const updateData: any = {};
    let expedienteAnterior: any = null;
    if (file) {
      // Buscar expediente anterior para eliminar el archivo viejo
      expedienteAnterior = await Expediente.findByPk(idExpediente);
      if (expedienteAnterior && expedienteAnterior.pathExpediente) {
        try {
          if (fs.existsSync(expedienteAnterior.pathExpediente)) {
            fs.unlinkSync(expedienteAnterior.pathExpediente);
          }
        } catch (err) {
          // No detener el flujo si no se puede borrar, pero loguear
          console.error('No se pudo eliminar el archivo anterior:', err);
        }
      }
      updateData.filename = file.filename;
      updateData.pathExpediente = file.path;
    }
    if (idDenuncia !== undefined) {
      updateData.idDenuncia = idDenuncia;
    }
    if (tipoExpediente !== undefined) {
      updateData.tipoExpediente = tipoExpediente;
    }
    const [updatedRows] = await Expediente.update(updateData, {
      where: { id: idExpediente },
      returning: true
    });
    if (updatedRows === 0) {
      throw new Error('Expediente no encontrado');
    }
    const expedienteActualizado = await Expediente.findByPk(idExpediente);
    return expedienteActualizado;
  } catch (error) {
    throw error;
  }
}






