import sequelize from '../config/database';
import { supabase } from '../config/supabase';
import { sanitizarRuta } from '../utils/sanitizar rutas';
import { Afectado, InformeAnexado, CumpleMedidas, medida, MedidasDefinitivas } from "../models";
import path from 'path';
import fs from 'fs-extra';
import { RegistrarLoggs } from './loggs.service';

export async function obtenerAfectados(id: number) { //---> se repite en audiencia de pruebas
  return await Afectado.findAll({
    where: { idDenuncia: id },
    attributes: ['id', 'nombres'],
  });
}

// Servicio para agregar cumplimiento de medidas
// Espera un objeto: { file: { path: string }, medidas: [{ idMedida, idAfectado, cumple }] }
// Importa tu instancia de supabase y sanitizarRuta según donde las tengas

export async function agregarCumplimientoMedidas(payload: {
  file?: Express.Multer.File;
  responsable: string;
  razon?: string;
  sancion?: string;
  medidas: any; // Puede llegar como string (por form-data) o como array
  codigoTramite?: string; // Opcional: para organizar las carpetas
},idUsuario:number,usuario:string,nombres:string,canton:string) {
  const t = await sequelize.transaction();
  let pathGenerado = ''; // Guardaremos el path aquí para poder borrar el archivo si la DB falla

  try {
    const storageType = process.env.STORAGE_TYPE || 'local';

    if (!payload.file) throw new Error('El archivo del informe es requerido');
    
    // 1. Manejo inteligente del arreglo 'medidas' (por si viene de un FormData)
    let medidasArray = payload.medidas;
    if (typeof payload.medidas === 'string') {
      try {
        medidasArray = JSON.parse(payload.medidas);
      } catch (e) {
        throw new Error('El formato de medidas no es válido. Debe ser un JSON válido.');
      }
    }
    
    if (!Array.isArray(medidasArray) || medidasArray.length === 0) {
      throw new Error('medidas es requerido y debe ser un arreglo con al menos un elemento');
    }

    // ==========================================
    // 2. LÓGICA DE ALMACENAMIENTO (NUBE VS LOCAL)
    // ==========================================
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
    const nombreGenerado = `${uniqueSuffix}-${payload.file.originalname}`;
    const rutaRelativa =sanitizarRuta(`${payload.codigoTramite}/seguimiento/${nombreGenerado}`) ;
   
    
    let pathParaDB = '';

    if (storageType === 'cloud') {
      // --- SUPABASE ---
      const { data, error } = await supabase.storage
        .from('expedientes') // Reutilizamos tu bucket seguro y privado
        .upload(rutaRelativa, payload.file.buffer, {
          contentType: payload.file.mimetype,
          upsert: false
        });

      if (error) throw error;
      pathParaDB = rutaRelativa; // Guardamos la ruta relativa interna (seguro)
      pathGenerado = pathParaDB; // Lo guardamos por si hay rollback

    } else {
      // --- LOCAL ---
      const baseDir = path.resolve('uploads', String(payload.codigoTramite),'seguimiento');
      const fullPath = path.join(baseDir, nombreGenerado);

      await fs.ensureDir(baseDir);
      await fs.writeFile(fullPath, payload.file.buffer);
      
      const rutaWeb = rutaRelativa.replace(/\\/g, '/');
      pathParaDB = `/uploads/${rutaWeb}`;
      pathGenerado = fullPath; // Lo guardamos por si hay rollback
    }

    
    // 3. LÓGICA DE BASE DE DATOS (Con transacción)
    
    const informe = await InformeAnexado.create({ 
      pathInforme: pathParaDB, 
      fileName: nombreGenerado, 
      responsable: payload.responsable, 
      razon: payload.razon, 
      sancion: payload.sancion
      
    }, { transaction: t });

    const registros: any[] = [];
    for (const m of medidasArray) {
      const idMedida = m.idMedida ?? m.idmedida ?? m.idmedida;
      const idAfectado = m.idAfectado ?? m.idAfectado ?? m.id_afectado ?? m.idAfectado;
      const cumple = typeof m.cumple === 'boolean' ? m.cumple : (m.cumple === '1' || m.cumple === 1);
      const estatus = 'completada';

      if (!idMedida || !idAfectado) {
        throw new Error('Cada medida debe contener idMedida y idAfectado');
      }

      registros.push({ idMedida, cumple, estatus, idPath: informe.id, idAfectado });
    }

    // Validar que las medidas existan
    const medidaIds = [...new Set(registros.map(r => r.idMedida))];
    const medidasExistentes = await medida.findAll({ 
      where: { id: medidaIds }, 
      attributes: ['id'],
      transaction: t // <-- Agregamos la transacción aquí también para ser consistentes
    });
    
    if (medidasExistentes.length !== medidaIds.length) {
      throw new Error('Alguna idMedida no existe en la base de datos');
    }

    // Insertar registros
    const created = await CumpleMedidas.bulkCreate(registros, { transaction: t });

    RegistrarLoggs({
                      idUsuario: idUsuario,
                      usuario:usuario ,
                      nombres: nombres,
                      fase:'Seguimiento de medidas',
                      accion:'CREATE' ,
                      descripcion:` ${usuario} acaba de agregar un informe de seguimiento de medidas  relacionado al  codigo de expediente ${payload.codigoTramite}` ,
                      canton:canton
                      
                      });

    await t.commit();
    return { success: true, informeId: informe.id, createdCount: created.length, created };

  } catch (error) {
    // Si la DB falla, deshacemos los cambios
    await t.rollback();

    // Limpieza (Opcional pero recomendada): Si el archivo se subió pero la DB falló, intentamos borrar el archivo "huérfano"
    if (pathGenerado) {
      try {
        const storageType = process.env.STORAGE_TYPE || 'local';
        if (storageType === 'local' && fs.existsSync(pathGenerado)) {
          fs.unlinkSync(pathGenerado);
        } else if (storageType === 'cloud') {
          await supabase.storage.from('expedientes').remove([pathGenerado]);
        }
      } catch (cleanupError) {
        console.error('Error al limpiar el archivo huérfano tras fallo de DB:', cleanupError);
      }
    }

    throw error;
  }
}

// Servicio para actualizar cumplimiento de medidas con archivo existente
// Espera un objeto: { idPath: number, file: { path: string }, medidas: [{ idMedida, idAfectado, cumple }] }


export async function actualizarCumplimientoMedidas(payload: {
  idPath: number; // El ID del InformeAnexado
  file?: Express.Multer.File; // Ahora es opcional
  responsable?: string;
  razon?: string;
  sancion?: string;
  medidas: any;
  codigoTramite?: string;
},idUsuario:number,usuario:string,nombres:string,canton:string) {
  const t = await sequelize.transaction();
  let pathNuevoGenerado = ''; // Para limpiar si la transacción falla
  const storageType = process.env.STORAGE_TYPE || 'local';

  try {
    if (!payload.idPath) throw new Error('idPath es requerido');
    
    // Parsear medidas si vienen como string desde FormData
    let medidasArray = payload.medidas;
    if (typeof payload.medidas === 'string') {
      medidasArray = JSON.parse(payload.medidas);
    }
    if (!Array.isArray(medidasArray) || medidasArray.length === 0) {
      throw new Error('medidas es requerido y debe ser un arreglo');
    }

    // 1. Buscar el informe existente PRIMERO
    const informeExistente = await InformeAnexado.findByPk(payload.idPath, { transaction: t });
    if (!informeExistente) {
      throw new Error('Informe no encontrado');
    }

    // Preparar objeto de actualización de la DB
    const updateData: any = {
      responsable: payload.responsable !== undefined ? payload.responsable : informeExistente.responsable,
      razon: payload.razon !== undefined ? payload.razon : informeExistente.razon,
      sancion: payload.sancion !== undefined ? payload.sancion : informeExistente.sancion
    };

    // ==========================================
    // 2. LÓGICA DE REEMPLAZO DE ARCHIVO (SI SE ENVIÓ UNO NUEVO)
    // ==========================================
    if (payload.file) {
      
      
      // FASE A: ELIMINAR EL ARCHIVO ANTERIOR
      if (informeExistente.pathInforme) {
        console.log(informeExistente.pathInforme)
        try {
          if (storageType === 'local') {
            const physicalPath = path.join(process.cwd(), informeExistente.pathInforme);
            console.log(physicalPath)
            if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
          } else if (storageType === 'cloud') {
            // Asumiendo que guardaste la ruta relativa en Supabase
            const { error } = await supabase.storage.from('expedientes').remove([informeExistente.pathInforme]);
            if (error) console.error("Error borrando de Supabase:", error);
          }
        } catch (err) {
          console.error(`No se pudo eliminar el archivo anterior en modo ${storageType}:`, err);
        }
      }

      // FASE B: SUBIR EL NUEVO ARCHIVO
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);
      const nombreGenerado = `${uniqueSuffix}-${payload.file.originalname}`;
      const rutaRelativa =`${payload.codigoTramite}/seguimiento/${nombreGenerado}` ;

      if (storageType === 'cloud') {
        const rutaSanitizada =sanitizarRuta(rutaRelativa)
        const { data, error } = await supabase.storage
          .from('expedientes')
          .upload(rutaSanitizada, payload.file.buffer, { contentType: payload.file.mimetype, upsert: false });

        if (error) throw error;
        updateData.pathInforme = rutaSanitizada;
        pathNuevoGenerado = rutaSanitizada;

      } else {
        const baseDir = path.resolve('uploads', String(payload.codigoTramite),'seguimiento');
        const fullPath = path.join(baseDir, nombreGenerado);

        await fs.ensureDir(baseDir);
        await fs.writeFile(fullPath, payload.file.buffer);
        
        updateData.pathInforme = `/uploads/${rutaRelativa.replace(/\\/g, '/')}`;
        pathNuevoGenerado = fullPath;
      }

      updateData.fileName = nombreGenerado;
    }

    // 3. Actualizar el informe en la DB
    await informeExistente.update(updateData, { transaction: t });

    // ==========================================
    // 4. LÓGICA DE MEDIDAS (Mantenida de tu código original)
    // ==========================================
    const idAfectado = parseInt(String(medidasArray[0]?.idAfectado ?? medidasArray[0]?.id_afectado));
    if (!idAfectado) throw new Error('idAfectado es requerido');

    const medidasExistentes = await CumpleMedidas.findAll({
      where: { idPath: payload.idPath, idAfectado: idAfectado },
      transaction: t
    });

    const medidasExistentesMap = new Map();
    medidasExistentes.forEach(m => medidasExistentesMap.set(m.idMedida, m));

    let actualizadosCount = 0;
    let creadosCount = 0;

    for (const m of medidasArray) {
      const idMedida = parseInt(String(m.idMedida ?? m.idmedida));
      const cumple = typeof m.cumple === 'boolean' ? m.cumple : (m.cumple === '1' || m.cumple === 1);
      const estatus = 'completada';

      if (!idMedida) throw new Error('Cada medida debe contener idMedida válido');

      const registroExistente = medidasExistentesMap.get(idMedida);

      if (registroExistente) {
        await registroExistente.update({ cumple, estatus }, { transaction: t });
        actualizadosCount++;
      } else {
        await CumpleMedidas.create({
          idMedida, cumple, estatus, idPath: payload.idPath, idAfectado: idAfectado
        }, { transaction: t });
        creadosCount++;
      }
    }

    RegistrarLoggs({
                      idUsuario: idUsuario,
                      usuario:usuario ,
                      nombres: nombres,
                      fase:'Seguimiento de medidas',
                      accion:'UPDATE' ,
                      descripcion:` ${usuario} acaba de actualizar el  seguimiento de medidas  relacionado al  codigo de expediente ${payload.codigoTramite}` ,
                      canton:canton
                      
                      });

    // Si todo salió bien, guardamos en base de datos
    await t.commit();

    return { 
      success: true, 
      informeId: payload.idPath,
      informeActualizado: true,
      actualizadosCount,
      creadosCount,
      informeanterior: informeExistente, // Aquí ya tendrá los datos actualizados
      totalProcesados: actualizadosCount + creadosCount
    };

  } catch (error) {
    // 5. ROLLBACK Y LIMPIEZA
    await t.rollback();
    
    // Si la DB falló pero alcanzamos a subir un archivo nuevo, lo borramos para no dejar basura
    if (pathNuevoGenerado) {
      try {
        if (storageType === 'local' && fs.existsSync(pathNuevoGenerado)) {
          fs.unlinkSync(pathNuevoGenerado);
        } else if (storageType === 'cloud') {
          await supabase.storage.from('expedientes').remove([pathNuevoGenerado]);
        }
      } catch (cleanupError) {
        console.error('Error al limpiar el archivo nuevo tras fallo de DB:', cleanupError);
      }
    }
    
    throw error;
  }
}

// Servicio para obtener todas las medidas definitivas por afectado
export async function obtenerMedidasDefinitivasPorAfectado(idAfectado: number) {
  try {
    // Buscar todas las medidas definitivas del afectado
    const medidasDefinitivas = await MedidasDefinitivas.findAll({
      where: { idAfectado },
      include: [
        {
          model: medida,
          as: 'MedidasD',
          attributes: ['id', 'medidas']
        }
      ],
      attributes: ['idMedida', 'periodo', 'observaciones']
    });

    // Mapear medidas definitivas
    const todasLasMedidas = medidasDefinitivas.map((m: any) => ({
      idMedida: m.idMedida,
      medida: m.MedidasD?.medidas,
      idAfectado: idAfectado
    }));

    return todasLasMedidas;

  } catch (error) {
    throw error;
  }
}

// Servicio para obtener medidas identificadas por afectado que no están cumplidas
export async function obtenerMedidasPendientesPorAfectado(idAfectado: number) {
  try {
    // Buscar todas las medidas definitivas del afectado
    const medidasDefinitivas = await MedidasDefinitivas.findAll({
      where: { idAfectado },
      include: [
        {
          model: medida,
          as: 'MedidasD',
          attributes: ['id', 'medidas']
        }
      ],
      attributes: ['idMedida', 'periodo', 'observaciones']
    });

    // Mapear medidas definitivas
    const todasLasMedidas = medidasDefinitivas.map((m: any) => ({
      idMedida: m.idMedida,
      medida: m.MedidasD?.medidas,
      periodo: m.periodo,
      observaciones: m.observaciones,
      tipo: 'definitiva'
    }));

    // Obtener IDs únicos de medidas
    const idsMedidas = [...new Set(todasLasMedidas.map(m => m.idMedida))];

    // Buscar registros de cumplimiento existentes
    const cumplimientos = await CumpleMedidas.findAll({
      where: {
        idAfectado,
        idMedida: idsMedidas
      },
      attributes: ['idMedida', 'cumple']
    });

    // Crear mapa de cumplimientos para búsqueda rápida
    const cumplimientoMap = new Map();
    cumplimientos.forEach((c: any) => {
      cumplimientoMap.set(c.idMedida, c.cumple);
    });

    // Filtrar medidas que NO están cumplidas
    const medidasPendientes = todasLasMedidas.filter(medida => {
      const cumple = cumplimientoMap.get(medida.idMedida);
      // Incluir si: no existe registro de cumplimiento O cumple es false
      return cumple === undefined || cumple === false;
    });

    return medidasPendientes;

  } catch (error) {
    throw error;
  }
}

// Servicio para obtener las medidas cumplidas por afectado
export async function obtenerMedidasCumplidasPorAfectado(idAfectado: number) {
  try {
    // Buscar todas las medidas definitivas del afectado
    const medidasDefinitivas = await MedidasDefinitivas.findAll({
      where: { idAfectado },
      include: [
        {
          model: medida,
          as: 'MedidasD',
          attributes: ['id', 'medidas']
        }
      ],
      attributes: ['idMedida', 'periodo', 'observaciones']
    });

    // Mapear medidas definitivas
    const todasLasMedidas = medidasDefinitivas.map((m: any) => ({
      idMedida: m.idMedida,
      medida: m.MedidasD?.medidas,
      periodo: m.periodo,
      observaciones: m.observaciones,
      tipo: 'definitiva'
    }));

    // Obtener IDs únicos de medidas
    const idsMedidas = [...new Set(todasLasMedidas.map(m => m.idMedida))];

    // Buscar registros de cumplimiento existentes con información del informe
    const cumplimientos = await CumpleMedidas.findAll({
      where: {
        idAfectado,
        idMedida: idsMedidas
      },
      include: [
        {
          model: InformeAnexado,
          as: 'InformeAnexado',
          attributes: ['pathInforme', 'fileName', 'responsable', 'razon', 'sancion',]
        }
      ],
      attributes: ['idMedida', 'cumple', 'idPath']
    });

    // Agrupar medidas por archivo directamente desde los cumplimientos
    const informesPorArchivo = new Map();

    cumplimientos.forEach((c: any) => {
      // Solo procesar si tiene archivo anexado
      if (c.InformeAnexado) {
        const archivoKey = c.InformeAnexado.pathInforme;
        
        // Inicializar el archivo si no existe
        if (!informesPorArchivo.has(archivoKey)) {
          informesPorArchivo.set(archivoKey, {
            archivo: {
              path: c.InformeAnexado.pathInforme,
              fileName: c.InformeAnexado.fileName,
              responsable: c.InformeAnexado.responsable,
              razon: c.InformeAnexado.razon,
              sancion: c.InformeAnexado.sancion,
              idPath: c.idPath,
              idAfectado: idAfectado
            },
            cumplemedida: [],
            nocumplemedida: []
          });
        }

        // Buscar la información de la medida
        const medidaInfo = todasLasMedidas.find(m => m.idMedida === c.idMedida);
        if (medidaInfo) {
          const informe = informesPorArchivo.get(archivoKey);
          if (c.cumple === true) {
            informe.cumplemedida.push(medidaInfo.medida);
          } else if (c.cumple === false) {
            informe.nocumplemedida.push(medidaInfo.medida);
          }
        }
      }
    });
    

    return Array.from(informesPorArchivo.values());

  } catch (error) {
    throw error;
  }
}
