


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
  numOficio: string;
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
        numOficio: data.numOficio,
        estatus: 'completada',

      }, { transaction: t });
    

    await t.commit();
    return notificacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
//servicio para obtener los involucrados principales a notificar
export  async function  involucradosANotificacion(id:string){
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
      }
    ],
    attributes: [] 
  });
    const personasArray: { idUsuario: number, nombres: string, parte: string }[] = [
    ...(personas?.Denunciantes || []).map(d => ({idUsuario: d.id, nombres: [d.nombres, d.apellidos].filter(Boolean).join(' ').trim(), parte:'Denunciante'})),
    ...(personas?.Denunciados || []).map(d => ({ idUsuario: d.id, nombres: [d.nombres, d.apellidos].filter(Boolean).join(' ').trim(), parte:'Denunciado' }))
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
        idDenuncia: id,
        estado: notificado ? 'Notificado' : 'Por Notificar',
        idNotificacion: notificado ? notificado.id : null
      });
    }
    
    return resultado;

  

} 
//servicio para obtener otros principales a notificar
export  async function  otrosANotificacion(id:string){
  const existeAvocatoria = await Avocatoria.findOne({ where: { idDenuncia: id } });

  if(!existeAvocatoria) {
    const error = new Error("No existe una avocatoria para esta denuncia");
    error.name = "NoExisteAvocatoria";
    throw error;
  }
  const personas = await Denuncia.findByPk(id,{
    include: [
      
      {
        model: Otros,
        attributes:['nombres','tipoParticipante','apellidos','cargo','institucion','cedula', 'id', 'fase'],
        as:'otros',
        where: { fase: 'notificacion' },
        required: false
      }
    ],
    attributes: [] 
  });
    const personasArray: { idUsuario: number, nombresCompletos: string, parte: string,nombres: string,apellidos: string,cargo: string,institucion: string,cedula: string }[] = [
    
    ...(personas?.otros || []).map(n => ({ idUsuario: n.id, nombresCompletos: [n.nombres, n.apellidos].filter(Boolean).join(' ').trim(), parte: n.tipoParticipante, nombres: n.nombres, apellidos: n.apellidos, cargo: n.cargo, institucion: n.institucion, cedula: n.cedula }))
  ].filter(p => p.nombresCompletos);

    // Buscar notificación para cada persona
    const resultado = [];
    for (const persona of personasArray) {
      // Busca notificación con diriguidoA igual al nombre completo
      const notificado = await Notificacion.findOne({
        where: { idDenuncia: id, diriguidoA: persona.nombresCompletos }
      });
      resultado.push({
        ...persona,
        idDenuncia: id,
        estado: notificado ? 'Notificado' : 'Por Notificar',
        idNotificacion: notificado ? notificado.id : null
      });
    }
    
    return resultado;

  

} 

//servicio para crear otros notificados
export async function crearOtrosNotificados(data: any) {
  // params: { nombres, apellidos, cedula, cargo, institucion, idDenuncia, tipoParticipante }
  const { nombres, apellidos, cedula, cargo, institucion, idDenuncia, tipoParticipante } = data;
  
  const nuevoOtro = await Otros.create({
    nombres,
    apellidos,
    cedula,
    cargo,
    institucion,
    idDenuncia,
    tipoParticipante,
    fase: 'notificacion'
  });
  return nuevoOtro;
}

//servicio para eliminar otros notificados
export async function eliminarOtrosNotificados(id: number) {
  const t = await sequelize.transaction();
  try {
    const otroNotificado = await Otros.findOne({ 
      where: { 
        id: id, 
        fase: 'notificacion' 
      } 
    });

    if (!otroNotificado) {
      const error = new Error("No se encontró el registro a eliminar");
      error.name = "NoEncontrado";
      throw error;
    }

    await otroNotificado.destroy({ transaction: t });
    await t.commit();
    
    return { message: "Registro eliminado correctamente" };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

//servicio para actualizar otros notificados
export async function actualizarOtrosNotificados(id: number, data: any) {
  const t = await sequelize.transaction();
  try {
    const { nombres, apellidos, cedula, cargo, institucion, tipoParticipante } = data;

    const otroNotificado = await Otros.findOne({ 
      where: { 
        id: id, 
        fase: 'notificacion' 
      } 
    });

    if (!otroNotificado) {
      const error = new Error("No se encontró el registro a actualizar");
      error.name = "NoEncontrado";
      throw error;
    }

    await otroNotificado.update({
      nombres,
      apellidos,
      cedula,
      cargo,
      institucion,
      tipoParticipante
    }, { transaction: t });

    await t.commit();
    return otroNotificado;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}


//servicio para obtener los datos para la notificacion
export async function notifiacionesDTO(id:string, tipoInvolucrado?:string,idInvolucrado?:string, idNotificacion?:string) {
  console.log("Entrando a notifiacionesDTO con parámetros:", { id, tipoInvolucrado, idInvolucrado, idNotificacion });
  const existeAvocatoria = await Avocatoria.findOne({ where: { idDenuncia: id } });

  if(!existeAvocatoria) {
    const error = new Error("No existe una avocatoria para esta denuncia");
    error.name = "NoExisteAvocatoria";
    throw error;
  }

  // Configurar includes dinámicamente según el tipoInvolucrado
  const includes: any[] = [
    {
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
      ...(idNotificacion && { where: { id: idNotificacion } }),
      attributes: ['id']
    }
  ];

  // Agregar include específico según tipoInvolucrado
  if (tipoInvolucrado) {
    switch (tipoInvolucrado.toLowerCase()) {
      case 'denunciante':
        const whereClauseDenunciante: any = {};
        if (idInvolucrado) {
          whereClauseDenunciante.id = idInvolucrado;
        }
        includes.push({
          model: Denunciante,
          attributes: ['nombres', 'apellidos', 'cedula'],
          where: whereClauseDenunciante,
          required: !!idInvolucrado
        });
        break;
      case 'denunciado':
        const whereClauseDenunciado: any = {};
        if (idInvolucrado) {
          whereClauseDenunciado.id = idInvolucrado;
        }
        includes.push({
          model: Denunciado,
          attributes: ['nombres', 'apellidos', 'cedula'],
          where: whereClauseDenunciado,
          required: !!idInvolucrado
        });
        break;
      case 'otros':
        const whereClauseOtros: any = { fase: 'notificacion' };
        if (idInvolucrado) {
          whereClauseOtros.id = idInvolucrado;
         
        }
        includes.push({
          model: Otros,
          as: 'otros',
          attributes: ['nombres', 'apellidos', 'cedula', 'tipoParticipante'],
          where: whereClauseOtros,
          required: false
        });
        break;
        case 'representante institucional':
        const whereClauseinstitucion: any = { fase: 'notificacion' };
        if (idInvolucrado) {
          whereClauseinstitucion.id = idInvolucrado;
          
        }
        includes.push({
          model: Otros,
          as: 'otros',
          attributes: ['nombres', 'apellidos', 'cedula', 'tipoParticipante', 'cargo', 'institucion'],
          where: whereClauseinstitucion,
          required: false
        });
        break;
    }
  }
  console.log("Includes configurados:", includes);

  const resultado = await Denuncia.findByPk(id, {
    attributes: ['codigoTramite'],
    include: includes
  });

  console.log("Resultado de la consulta:", resultado);

  const { codigoTramite, avocatoria:avo, canton:can, Notificacions:notif, Denunciantes, Denunciados, otros } = resultado as any;
  
  // Formatear respuesta base
  const respuestaFormateada: any = {
    codigoTramite,
    fechaCreado: avo?.fechaCreado || '',
    Canton: can?.canton || '',
    id: notif?.[0]?.id || ''
  };

  // Agregar datos específicos según tipoInvolucrado
  if (tipoInvolucrado) {
    switch (tipoInvolucrado.toLowerCase()) {
      case 'denunciante':
        if (Denunciantes && Denunciantes.length > 0) {
          const denunciante = Denunciantes[0];
          respuestaFormateada.datosPersona = {
            nombres: denunciante.nombres,
            apellidos: denunciante.apellidos,
            cedula: denunciante.cedula,
            tipoInvolucrado: 'Denunciante'
          };
        }
        break;
      case 'denunciado':
        if (Denunciados && Denunciados.length > 0) {
          const denunciado = Denunciados[0];
          respuestaFormateada.datosPersona = {
            nombres: denunciado.nombres,
            apellidos: denunciado.apellidos,
            cedula: denunciado.cedula,
            tipoInvolucrado: 'Denunciado'
          };
        }
        break;
      case 'otros' :
        if (otros && otros.length > 0) {
          const otro = otros[0];
          respuestaFormateada.datosPersona = {
            nombres: otro.nombres,
            apellidos: otro.apellidos,
            cedula: otro.cedula,
            tipoInvolucrado: otro.tipoParticipante || 'Otros'
          };
        }
        break;
        case 'representante institucional':
        if (otros && otros.length > 0) {
          const institucionData = otros[0];
          respuestaFormateada.datosPersona = {
            nombres: institucionData.nombres,
            apellidos: institucionData.apellidos,
            cedula: institucionData.cedula,
            cargo: institucionData.cargo,
            institucion: institucionData.institucion,
            tipoInvolucrado: institucionData.tipoParticipante || 'Otros'
          };
        }
        break;
    }
  }
  console.log("Respuesta formateada:", respuestaFormateada);

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

  // Obtener cargo e institución si la parte es "institucion"
  let cargo = '';
  let institucion = '';
  if (notificacion.parte && notificacion.parte.toLowerCase() === 'representante institucional' && notificacion.idUsuario) {
    const otroData = await Otros.findOne({
      where: { 
        id: notificacion.idUsuario,
        fase: 'notificacion'
      },
      attributes: ['cargo', 'institucion']
    });
    cargo = otroData?.cargo || '';
    institucion = otroData?.institucion || '';
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
    numOficio: notificacion.numOficio,
    fechaCreado: (notificacion as any).fechaCreado,
    canton,
    cargo,
    institucion
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
      numOficio: data.numOficio,
      idUsuario: data.idUsuario,
      
    }, { transaction: t });
    await t.commit();
    return notificacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}




 