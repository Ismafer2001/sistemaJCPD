import sequelize from "../config/database";
import {  Avocatoria, Canton, Denuncia, Denunciado, Denunciante, Notificacion, Otros } from "../models";
import { Citacion } from "../models/citaciones.model";
import { RegistrarLoggs } from "./loggs.service";

//servicio para obtener las personas citadas en una citacion
export  async function  involucradosACitar(id:string){
  const existeNotificacion = await Notificacion.findOne({ where: { idDenuncia: id } });

  if(!existeNotificacion) {
    const error = new Error("No existe una notificación para esta denuncia");
    error.name = "NoExisteNotificacion";
    throw error;
  }

  // Buscar todas las citaciones asociadas a la denuncia
  const personas = await Denuncia.findByPk(id,{
    include: [
      {
        model: Denunciante,
        attributes:['nombres', 'apellidos', 'cedula', 'id','estado_citar','id_citacion']
      },
      {
        model: Denunciado,
        attributes:['nombres', 'apellidos', 'cedula', 'id','estado_citar','id_citacion']
      },
      {
        model: Otros,
        attributes:['nombres','tipoParticipante','apellidos','cargo','institucion','cedula', 'id', 'fase','estado_citar','id_citacion'],
        as:'otros',
        where: { fase: 'notificacion' },
        required: false
      }
    ],
    attributes: [] 
  });
  const personasArray: { idUsuario: number, nombres: string, parte: string,estado:string, idCitacion:number }[] = [
    ...(personas?.Denunciantes || []).map(d => ({idUsuario: d.id, nombres: [d.nombres, d.apellidos].filter(Boolean).join(' ').trim(), parte:'Denunciante',estado:d.estado_citar,idCitacion:d.id_citacion})),
    ...(personas?.Denunciados || []).map(d => ({ idUsuario: d.id, nombres: [d.nombres, d.apellidos].filter(Boolean).join(' ').trim(), parte:'Denunciado',estado:d.estado_citar,idCitacion:d.id_citacion })),
    ...(personas?.otros || []).map(o => ({ idUsuario: o.id, nombres: [o.nombres, o.apellidos].filter(Boolean).join(' ').trim(), parte: o.tipoParticipante,estado:o.estado_citar,idCitacion:o.id_citacion }))
  ].filter(p => p.nombres);

   const resultado = [];
    for (const persona of personasArray) {
     
    
      resultado.push({
        ...persona,
        idDenuncia: id,
        estado: persona.estado || 'Por Citar',
        idCitacion: persona.idCitacion|| null
      });
    }

  return resultado;

} 

//servicio para obtener los otros a citar
export  async function  otrosACitar(id:string){
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
        attributes:['nombres','tipoParticipante','apellidos','cargo','institucion','cedula', 'id', 'fase','estado_citar','id_citacion'],
        as:'otros',
        where: { fase: 'Citacion' },
        required: false
      }
    ],
    attributes: [] 
  });
    const personasArray: { idUsuario: number, nombresCompletos: string, parte: string,nombres: string,apellidos: string,cargo: string,institucion: string,cedula: string,estado:string, idCitacion:number }[] = [
    
    ...(personas?.otros || []).map(n => ({ idUsuario: n.id, nombresCompletos: [n.nombres, n.apellidos].filter(Boolean).join(' ').trim(), parte: n.tipoParticipante, nombres: n.nombres, apellidos: n.apellidos, cargo: n.cargo, institucion: n.institucion, cedula: n.cedula,estado:n.estado_citar,idCitacion:n.id_citacion }))
  ].filter(p => p.nombresCompletos);

    // Buscar notificación para cada persona
    const resultado = [];
    for (const persona of personasArray) {
      // Busca notificación con diriguidoA igual al nombre completo
      
      resultado.push({
        ...persona,
        idDenuncia: id,
        estado: persona.estado || 'Por Citar',
        idCitacion: persona.idCitacion|| null
      });
    }
    
    return resultado;

  

} 
//servicio para crear otros citados
export async function crearOtrosCitados(data: any,idUsuario:number,usuario:string,nombresUser:string,canton:string) {
  // params: { nombres, apellidos, cedula, cargo, institucion, idDenuncia, tipoParticipante }
  const { nombres, apellidos, cedula, cargo, institucion, idDenuncia, tipoParticipante } = data;
  const existeNotificacion = await Notificacion.findOne({where:{idDenuncia:data.idDenuncia}})
    if (!existeNotificacion) {
      const error = new Error("No existe notificaciones resgistrada ");
      error.name = "sinNotificacion";
      throw error;
    }
  
  const nuevoOtro = await Otros.create({
    nombres,
    apellidos,
    cedula,
    cargo,
    institucion,
    idDenuncia,
    tipoParticipante,
    fase: 'Citacion'
  });
  
  RegistrarLoggs({
				idUsuario: idUsuario,
				usuario:usuario ,
				nombres: nombresUser,
				fase:'Citacion',
				accion:'CREATE' ,
				descripcion:` $${usuario} acaba de agregar a ${nombres} ${apellidos} para citar relacionado al codigo de expediente ${existeNotificacion.codigoTramite}` ,
				canton:canton
								
				});
  return nuevoOtro;
}
// secivio para obtener los datos para la citacion 
export async function citacionesDTO(id:string, tipoInvolucrado?:string, idInvolucrado?:string, idCitacion?:string) {
 
  // Configurar includes dinámicamente según el tipoInvolucrado
  const includes: any[] = [
    {
      model: Canton,
      attributes:['canton'],
      as: "canton"
    },
    {
      model: Citacion,
      ...(idCitacion && { where: { id: idCitacion } }),
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
        const whereClauseOtros: any = {  };
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
        const whereClauseInstitucion: any = {  };
        if (idInvolucrado) {
          whereClauseInstitucion.id = idInvolucrado;
        }
        includes.push({
          model: Otros,
          as: 'otros',
          attributes: ['nombres', 'apellidos', 'cedula', 'tipoParticipante', 'cargo', 'institucion'],
          where: whereClauseInstitucion,
          required: false
        });
        break;
    }
  }

  const resultado = await Denuncia.findByPk(id, {
    attributes: ['codigoTramite'],
    include: includes
  });

  const { codigoTramite, canton:can, Citacions:citaciones, Denunciantes, Denunciados, otros } = resultado as any;
  
  // Formatear respuesta base
  const respuestaFormateada: any = {
    codigoTramite,
    Canton: can?.canton || '',
    id: citaciones?.[0]?.id || ''
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
      case 'otros':
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

  return respuestaFormateada;
}
//servicio para crear una citacion
export async function crearcitacion(data:any,idUsuario:number,usuario:string,nombres:string,canton:string) {
  const t = await sequelize.transaction();
  try {
      const citacion = await Citacion.create({
        idDenuncia: data.idDenuncia,
        codigoTramite: data.codigoTramite,
        fecha: data.fecha,
        hora: data.hora,
        direccion: data.direccion,
        local: data.local,
        parte: data.parte,
        diriguidoA: data.diriguidoA,
        razon: data.razon,
        estatus: 'completada',
        idUsuario: data.idUsuario

      }, { transaction: t });
      if(data.parte ==='Denunciante'){
        await Denunciante.update({id_notificacion:citacion.id,estado_citar:'Citado'},
          {where:{id:data.idUsuario}}
        )

      }else if(data.parte==='Denunciado'){
        await Denunciado.update({id_notificacion:citacion.id,estado_citar:'Citado'},
          {where:{id:data.idUsuario}}
        )
      }else{
        
        await Otros.update({id_notificacion:citacion.id,estado_citar:'Citado'},
          {where:{id:data.idUsuario}}
        )
      }
    RegistrarLoggs({
                    idUsuario: idUsuario,
                    usuario:usuario ,
                    nombres: nombres,
                    fase:'Citacion',
                    accion:'CREATE' ,
                    descripcion:` ${usuario} acaba de registar una citacion con  codigo de expediente ${data.codigoTramite}` ,
                    canton:canton
                     
                  });

    await t.commit();
    return citacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
//funcion para actualizar una citacion
export async function actualizarCitacion(id: string, data: any,idUsuario:number,usuario:string,nombres:string,canton:string){
  const t = await sequelize.transaction();
  try {
    const citacion = await Citacion.findByPk(id);
    if (!citacion) {
      throw new Error('No existe la citación con el id proporcionado');
    }
    await citacion.update({
      idDenuncia: data.idDenuncia,
      codigoTramite: data.codigoTramite,
      fecha: data.fecha,
      hora: data.hora,
      direccion: data.direccion,
      local: data.local,
      parte: data.parte,
      razon: data.razon,
      diriguidoA: data.diriguidoA,
      estatus: data.estatus || 'completada',
      idUsuario: data.idUsuario
    }, { transaction: t });
    RegistrarLoggs({
                                            idUsuario: idUsuario,
                                            usuario:usuario ,
                                            nombres: nombres,
                                            fase:'Citacion',
                                            accion:'UPDATE' ,
                                            descripcion:` ${usuario} acaba de actualizar una citacion de id ${id} relacionado al codigo de expediente ${data.codigoTramite}` ,
                                            canton:canton
                                            
                                          });
    await t.commit();
    return citacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
} 
//funcion para obtener todas la infomacion de una citaciones
export async function obtenerCitacion(idCitacion: number) {

   const citacion = await Citacion.findByPk(idCitacion);
  if (!citacion) {
    throw new Error('No existe la citación con el id proporcionado');
  }
 
  // Obtener datos relacionados si se especificó tipoInvolucrado
 
  let canton = '';
  
  if (citacion.idDenuncia) {
    const denuncia = await Denuncia.findByPk(citacion.idDenuncia, {
      include: [{ model: Canton, as: 'canton', attributes: ['canton'] }]
    });
    canton = (denuncia as any)?.canton?.canton || '';
  }
    // Obtener cargo e institución si la parte es "institucion"
    let cargo = '';
    let institucion = '';
    if (citacion.parte && citacion.parte.toLowerCase() === 'representante institucional' && citacion.idUsuario) {
      const otroData = await Otros.findOne({
        where: { 
          id: citacion.idUsuario,
          fase: 'Citacion'
        },
        attributes: ['cargo', 'institucion']
      });
      cargo = otroData?.cargo || '';
      institucion = otroData?.institucion || '';
    }
  return {
    id: citacion.id,
    idDenuncia: citacion.idDenuncia,
    codigoTramite: citacion.codigoTramite,
    fecha: citacion.fecha,
    hora: citacion.hora,
    direccion: citacion.direccion,
    local: citacion.local,
    parte: citacion.parte,
    razon: citacion.razon,
    diriguidoA: citacion.diriguidoA,
    estatus: citacion.estatus,
    idUsuario: citacion.idUsuario,
    
    fechaCreado: (citacion as any).fechaCreado,
    canton,
    cargo ,
    institucion,
    
  };
}



//servicio para eliminar otros citados
export async function eliminarOtrosCitados(id: number,idUsuario:number,usuario:string,nombres:string,canton:string) {
  const t = await sequelize.transaction();
  try {
    const otroCitado = await Otros.findOne({ 
      where: { 
        id: id, 
        fase: 'Citacion' 
      } 
    });

    if (!otroCitado) {
      const error = new Error("No se encontró el registro a eliminar");
      error.name = "NoEncontrado";
      throw error;
    }

    await otroCitado.destroy({ transaction: t });
    RegistrarLoggs({
				idUsuario: idUsuario,
				usuario:usuario ,
				nombres: nombres,
				fase:'Citacion',
				accion:'DELETE' ,
				descripcion:` $${usuario} acaba de eliminar  a ${otroCitado.nombres} ${otroCitado.apellidos} de citar relacionado al codigo de expediente ${'existeNotificacion.codigoTramite'}` ,
				canton:canton
								
				});
    await t.commit();
    
    return { message: "Registro eliminado correctamente" };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

//servicio para actualizar otros citados
export async function actualizarOtrosCitados(id: number, data: any,idUsuario:number,usuario:string,nombresUser:string,canton:string) {
  const t = await sequelize.transaction();
  try {
    const { nombres, apellidos, cedula, cargo, institucion, tipoParticipante } = data;

    const otroCitado = await Otros.findOne({ 
      where: { 
        id: id, 
        fase: 'Citacion' 
      } 
    });

    if (!otroCitado) {
      const error = new Error("No se encontró el registro a actualizar");
      error.name = "NoEncontrado";
      throw error;
    }

    await otroCitado.update({
      nombres,
      apellidos,
      cedula,
      cargo,
      institucion,
      tipoParticipante
    }, { transaction: t });

    RegistrarLoggs({
				idUsuario: idUsuario,
				usuario:usuario ,
				nombres: nombresUser,
				fase:'Citacion',
				accion:'UPDATE' ,
				descripcion:` $${usuario} acaba de Actualizar a ${nombres} ${apellidos} para citar relacionado al codigo de expediente ${'existeNotificacion.codigoTramite'}` ,
				canton:canton
								
				});

    await t.commit();
    return otroCitado;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

