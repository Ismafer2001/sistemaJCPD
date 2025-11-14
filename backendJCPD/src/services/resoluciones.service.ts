import sequelize from '../config/database';
import { Afectado, Canton, Denuncia, medida, MedidasDefinitivas, Resoluciones, usuarios } from "../models";

// Servicio para obtener todos los datos de la resolución
export async function obtenerResolucionCompleta(idResolucion: number) {

  // Buscar la resolución
  const resolucion = await Resoluciones.findByPk(idResolucion);
  if (!resolucion) {
    throw new Error('No existe la resolución con el id proporcionado');
  }

  // Buscar el cantón de la resolución (a través de la denuncia)
    let usuariosPrincipales: any[] = [];
    let nombreCanton = '';
    const denuncia = await Denuncia.findByPk(resolucion.idDenuncia, { attributes: ['id_canton'] });
    if (denuncia && denuncia.id_canton) {
      usuariosPrincipales = await usuarios.findAll({
        where: {
          id_canton: denuncia.id_canton,
          rol: 'principal',
          isactivo: true
        },
        attributes: ['id', 'nombres', 'apellidos', 'correo', 'rol', 'id_canton']
      });
      const canton = await Canton.findByPk(denuncia.id_canton, { attributes: ['canton'] });
      if (canton) nombreCanton = canton.canton;
    }

  


  
  // Buscar todos los afectados de la denuncia asociada a la audiencia
  const afectados = await Afectado.findAll({
    where: { idDenuncia: resolucion.idDenuncia },
    attributes: ['id', 'nombres', 'apellidos', 'cedula']
  });

 
  // Medidas definitivas por afectado (fase denuncia)
  const medidasDefinitivasPorAfectado = await Promise.all(
    afectados.map(async (afectado: any) => {
      const medidas = await MedidasDefinitivas.findAll({
        where: { idAfectado: afectado.id },
        include: [{ model: medida, as: 'MedidasD', attributes: ['medidas'] }],
        attributes: ['idMedida', 'periodo', 'observaciones']
      });
      
      return {
        idAfectado: afectado.id,
        nombres: afectado.nombres,
        apellidos: afectado.apellidos,
        cedula: afectado.cedula,
        medidas: medidas.map((m: any) => ({
          idMedida: m.idMedida,
          medida: m.MedidasD?.medidas,
          periodo: m.periodo,
          observaciones: m.observaciones
        }))
      };
    })
    
  );
  

  // Estructura de respuesta
    return {
      idDenuncia: resolucion.idDenuncia,
      resolucion: resolucion.resolucion,
      consideraciones: resolucion.consideraciones,

      codigoTramite: resolucion.codigoTramite,
      
      canton: nombreCanton,
      
      medidasDefinitivas: medidasDefinitivasPorAfectado,
      usuariosPrincipalesCanton: usuariosPrincipales,
          
        };
}
export async function obtenerAfectados(id: number) { //---> se repite en audiencia de pruebas
  return await Afectado.findAll({
    where: { idDenuncia: id },
    attributes: ['id', 'nombres'],
  });
}

export async function crearResolucion(data: {
  codigoTramite: string;
  consideraciones: string;
  resolucion: string;
  pdf_resolucion?: string;
  idDenuncia: number;
  estatus: "pendiente"|"en_proceso"|"completada";
}) {
  const t = await sequelize.transaction();
  try {
    // Validar que todos los campos requeridos estén presentes
    if (!data.codigoTramite || !data.consideraciones || !data.resolucion || !data.idDenuncia) {
      throw new Error('Todos los campos son requeridos: codigoTramite, consideraciones, resolucion, idDenuncia');
    }

    // Verificar que el código de trámite sea único
    const existeCodigo = await Resoluciones.findOne({
      where: { codigoTramite: data.codigoTramite }
    });

    if (existeCodigo) {
      throw new Error('El código de trámite ya existe');
    }

    // Crear la resolución
    const nuevaResolucion = await Resoluciones.create({
      codigoTramite: data.codigoTramite,
      consideraciones: data.consideraciones,
      resolucion: data.resolucion,
      idDenuncia: data.idDenuncia,
      estatus: "completada"
    }, { transaction: t });

    await t.commit();
    return nuevaResolucion;

  } catch (error) {
    await t.rollback();
    throw error;
  }
}

// Servicio para obtener resoluciones por denuncia
export async function obtenerResolucionesPorDenuncia(idDenuncia: number) {
  try {
    const resoluciones = await Resoluciones.findAll({
      where: { idDenuncia },
      order: [['fecha_creado', 'DESC']]
    });

    return {
      success: true,
      data: resoluciones,
      count: resoluciones.length
    };

  } catch (error) {
    throw error;
  }
}

// Servicio para obtener una resolución por ID
export async function obtenerResolucionPorId(id: number) {
  try {
    const resolucion = await Resoluciones.findByPk(id);

    if (!resolucion) {
      throw new Error('Resolución no encontrada');
    }

    return {
      success: true,
      data: resolucion
    };

  } catch (error) {
    throw error;
  }
}