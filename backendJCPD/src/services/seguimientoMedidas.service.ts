import sequelize from '../config/database';
import { Afectado, InformeAnexado, CumpleMedidas, medida, MedidasDefinitivas } from "../models";

export async function obtenerAfectados(id: number) { //---> se repite en audiencia de pruebas
  return await Afectado.findAll({
    where: { idDenuncia: id },
    attributes: ['id', 'nombres'],
  });
}

// Servicio para agregar cumplimiento de medidas
// Espera un objeto: { file: { path: string }, medidas: [{ idMedida, idAfectado, cumple }] }
export async function agregarCumplimientoMedidas(payload: any) {
  const t = await sequelize.transaction();
  try {
    if (!payload || !payload.file || !payload.file.path) throw new Error('file.path requerido');
    if (!Array.isArray(payload.medidas) || payload.medidas.length === 0) throw new Error('medidas es requerido y debe ser un arreglo');

    // crear informe anexado
    const informe = await InformeAnexado.create({ pathInforme: payload.file.path, fileName: payload.file.fileName, responsable: payload.file.responsable, razon: payload.file.razon, sancion: payload.file.sancion }, { transaction: t });

    // preparar registros de cumplimiento
    const registros: any[] = [];
    for (const m of payload.medidas) {
      const idMedida = m.idMedida ?? m.idmedida ?? m.idmedida;
      const idAfectado = m.idAfectado ?? m.idAfectado ?? m.id_afectado ?? m.idAfectado;
      const cumple = typeof m.cumple === 'boolean' ? m.cumple : (m.cumple === '1' || m.cumple === 1);
      const estatus = 'completada'

      if (!idMedida || !idAfectado) {
        await t.rollback();
        throw new Error('Cada medida debe contener idMedida y idAfectado');
      }

      registros.push({ idMedida, cumple, estatus, idPath: informe.id, idAfectado });
    }

    // opcional: validar que las medidas referencien medidas existentes
    const medidaIds = [...new Set(registros.map(r => r.idMedida))];
    const medidasExistentes = await medida.findAll({ where: { id: medidaIds }, attributes: ['id'] });
    if (medidasExistentes.length !== medidaIds.length) {
      await t.rollback();
      throw new Error('Alguna idMedida no existe');
    }

    // insertar los registros en CumpleMedidas
    const created = await CumpleMedidas.bulkCreate(registros, { transaction: t });

    await t.commit();
    return { success: true, informeId: informe.id, createdCount: created.length, created };
  } catch (error) {
    await t.rollback();
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
          attributes: ['pathInforme', 'fileName', 'responsable', 'razon', 'sancion']
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
              sancion: c.InformeAnexado.sancion
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
    console.log(informesPorArchivo);

    return Array.from(informesPorArchivo.values());

  } catch (error) {
    throw error;
  }
}