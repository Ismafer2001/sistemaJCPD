


import { Notificacion } from "../models";
import sequelize from "../config/database";
import {  Avocatoria, Canton, Denuncia, Denunciado, Denunciante, Otros } from "../models";

export interface NotificacionDTO {
  idDenuncia: number;
  codigoTramite: string;
  fecha: Date;
  parte: string;
  diriguidoA: string;
  idUsuario: number;
  direccion: string;
  estatus: "pendiente"|"en_proceso"|"completada";
  
}

//servicio para crear notificaciones
export async function crearNotificacion(data: NotificacionDTO) {
  const t = await sequelize.transaction();
  try {
    const existeAvocatoria = await Avocatoria.findOne({ where: { idDenuncia: data.idDenuncia } });

  if(!existeAvocatoria) {
    const error = new Error("No existe una avocatoria para esta denuncia");
    error.name = "NoExisteAvocatoria";
    throw error;
  }
      const notificacion =await Notificacion.create({
        idDenuncia: data.idDenuncia,
        codigoTramite: data.codigoTramite,
        fechaAvocatoria: data.fecha,
        parte: data.parte,
        diriguidoA: data?.diriguidoA,
        direccion: data?.direccion,
        idUsuario: data.idUsuario,
        estatus: 'completada',

      }, { transaction: t });
    

    await t.commit();
    return notificacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
//servicio para obtener las personas a notificar
export  async function  personasNotificacion(id:string){
  const existeAvocatoria = await Avocatoria.findOne({ where: { idDenuncia: id } });

  if(!existeAvocatoria) {
    const error = new Error("No existe una avocatoria para esta denuncia");
    error.name = "NoExisteAvocatoria";
    throw error;
  }
  const personas = await Denuncia.findByPk(id,{
    include: [
      {
        model: Denunciante,
        attributes:['nombres', 'apellidos', 'cedula', 'id']
      },
      {
        model: Denunciado,
        attributes:['nombres', 'apellidos', 'cedula', 'id']
      },
      {
        model: Otros,
        attributes:['nombres','parte','apellidos','cedula', 'id', 'fase'],
        as:'otros',
        where: { fase: 'notificacion' },
        required: false
      }
    ],
    attributes: [] 
  });
    const personasArray: { idUsuario: number, nombres: string, parte: string }[] = [
    ...(personas?.Denunciantes || []).map(d => ({idUsuario: d.id, nombres: [d.nombres, d.apellidos].filter(Boolean).join(' ').trim(), parte:'Accionante'})),
    ...(personas?.Denunciados || []).map(d => ({ idUsuario: d.id, nombres: [d.nombres, d.apellidos].filter(Boolean).join(' ').trim(), parte:'Accionado' })),
    ...(personas?.otros || []).map(n => ({ idUsuario: n.id, nombres: [n.nombres, n.apellidos].filter(Boolean).join(' ').trim(), parte: n.parte }))
  ].filter(p => p.nombres);

    // Buscar notificación para cada persona
    const resultado = [];
    for (const persona of personasArray) {
      // Busca notificación con diriguidoA igual al nombre completo
      const notificado = await Notificacion.findOne({
        where: { idDenuncia: id, diriguidoA: persona.nombres }
      });
      resultado.push({
        ...persona,
        estado: notificado ? 'notificado' : 'por notificar',
        idNotificacion: notificado ? notificado.id : null
      });
    }
    return resultado;

  

} 

//servicio para crear otros notificados
export async function crearOtrosNotificados(data: any) {
  // params: { nombres, apellidos, cedula, parte, idDenuncia }
  const { nombres, apellidos, cedula, parte, idDenuncia } = data;
  
  const nuevoOtro = await Otros.create({
    nombres,
    apellidos,
    cedula,
    parte,
    idDenuncia,
    fase:'notificacion'
  });
  return nuevoOtro;
}


//servicio para obtener los datos para la notificacion
export async function notifiacionesDTO(id:string) {
  const existeAvocatoria = await Avocatoria.findOne({ where: { idDenuncia: id } });

  if(!existeAvocatoria) {
    const error = new Error("No existe una avocatoria para esta denuncia");
    error.name = "NoExisteAvocatoria";
    throw error;
  }
   const resultado = await Denuncia.findByPk(id, {
  attributes: ['codigoTramite'],
  include: [{
    model: Avocatoria,
    as:'avocatoria',
    attributes: ['fechaCreado']

  },
  {
    model: Canton,
    as: "canton",
    attributes:['canton']

  },
  {
    model: Notificacion,
    
    attributes: ['id']
  }
], 
  
});
console.log("Resultado de la consulta:", resultado);


const { codigoTramite, avocatoria:avo, canton:can, Notificacions:notif } = resultado as any;
  

const respuestaFormateada = {
  codigoTramite,

  fechaCreado: avo?.fechaCreado || '',
  Canton: can?.canton || '',
  id: notif?.[0]?.id || ''
};

return respuestaFormateada;



    
}

// Servicio para obtener los datos de una notificación por id
export async function obtenerDatosNotificacion(idNotificacion: number) {
  const notificacion = await Notificacion.findByPk(idNotificacion);
  if (!notificacion) {
    throw new Error('No existe la notificación con el id proporcionado');
  }
  // Obtener el canton desde la denuncia relacionada
  let canton = '';
  if (notificacion.idDenuncia) {
    const denuncia = await Denuncia.findByPk(notificacion.idDenuncia, {
      include: [{ model: Canton, as: 'canton', attributes: ['canton'] }]
    });
    canton = (denuncia as any)?.canton?.canton || '';
  }
  return {
    id: notificacion.id,
    idDenuncia: notificacion.idDenuncia,
    codigoTramite: notificacion.codigoTramite,
    fechaAvocatoria: notificacion.fechaAvocatoria,
    parte: notificacion.parte,
    diriguidoA: notificacion.diriguidoA,
    direccion: notificacion.direccion,
    idUsuario: notificacion.idUsuario,
    estatus: notificacion.estatus,
    datosGenerales: notificacion.datosGenerales,
    fechaCreado: (notificacion as any).fechaCreado,
    canton
  };
}

// Servicio para actualizar una notificación por id
export async function actualizarNotificacion(idNotificacion: number, data: NotificacionDTO) {
  const t = await sequelize.transaction();
  try {
    const notificacion = await Notificacion.findByPk(idNotificacion);
    if (!notificacion) {
      throw new Error('No existe la notificación con el id proporcionado');
    }
    await notificacion.update({
      idDenuncia: data.idDenuncia,
      codigoTramite: data.codigoTramite,
      fechaAvocatoria: data.fecha,
      parte: data.parte,
      diriguidoA: data.diriguidoA,
      direccion: data.direccion,
      idUsuario: data.idUsuario,
      
    }, { transaction: t });
    await t.commit();
    return notificacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}




 