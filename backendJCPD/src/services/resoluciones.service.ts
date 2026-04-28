import sequelize from '../config/database';
import { Afectado, Canton, Denuncia, medida, MedidasDefinitivas, Resoluciones, usuarios } from "../models";
import { RegistrarLoggs } from './loggs.service';

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
  estatus?: "pendiente"|"en_proceso"|"completada";
},idUsuario:number,usuario:string,nombres:string,canton:string) {
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

    RegistrarLoggs({
                      idUsuario: idUsuario,
                      usuario:usuario ,
                      nombres: nombres,
                      fase:'Resoluciones',
                      accion:'CREATE' ,
                      descripcion:` ${usuario} acaba de registrar la resolucion  con  codigo de expediente ${data.codigoTramite}` ,
                      canton:canton
                      
                      });

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
    const resolucion = await Resoluciones.findOne({
      where: { idDenuncia },
      attributes: ['id'],
      order: [['fecha_creado', 'DESC']]
    });

    return resolucion

  } catch (error) {
    throw error;
  }
}

// Servicio para actualizar una resolución
export async function actualizarResolucion(id: number, data: {
  codigoTramite?: string;
  consideraciones?: string;
  resolucion?: string;
  pdf_resolucion?: string;
  estatus?: "pendiente"|"en_proceso"|"completada";
},idUsuario:number,usuario:string,nombres:string,canton:string) {
  const t = await sequelize.transaction();
  try {
    // Buscar la resolución a actualizar
    const resolucionExistente = await Resoluciones.findByPk(id);
    
    if (!resolucionExistente) {
      throw new Error('Resolución no encontrada');
    }

    // Si se está actualizando el código de trámite, verificar que sea único
    if (data.codigoTramite && data.codigoTramite !== resolucionExistente.codigoTramite) {
      const existeCodigo = await Resoluciones.findOne({
        where: { codigoTramite: data.codigoTramite }
      });

      if (existeCodigo) {
        throw new Error('El código de trámite ya existe');
      }
    }

    // Actualizar la resolución
    await resolucionExistente.update({
      codigoTramite: data.codigoTramite ?? resolucionExistente.codigoTramite,
      consideraciones: data.consideraciones ?? resolucionExistente.consideraciones,
      resolucion: data.resolucion ?? resolucionExistente.resolucion,
      pdf_resolucion: data.pdf_resolucion ?? resolucionExistente.pdf_resolucion,
      
    }, { transaction: t });

    await t.commit();
    RegistrarLoggs({
                  idUsuario: idUsuario,
                  usuario:usuario ,
                  nombres: nombres,
                  fase:'Resoluciones',
                  accion:'UPDATE' ,
                  descripcion:` ${usuario} acaba de actualizar la resolicion con  codigo de expediente ${data.codigoTramite}` ,
                  canton:canton
                  
                  });
    
    // Retornar la resolución actualizada
    return await Resoluciones.findByPk(id);

  } catch (error) {
    await t.rollback();
    throw error;
  }
}
