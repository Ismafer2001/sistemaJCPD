import sequelize from "../config/database";
import {  Avocatoria, Canton, Denuncia, Denunciado, Denunciante, Notificacion, Otros } from "../models";
import { Citacion } from "../models/citaciones.model";

//servicio para obtener las personas citadas en una citacion
export  async function  personasCitacion(id:string){
  const existeNotificacion = await Notificacion.findOne({ where: { idDenuncia: id } });

  if(!existeNotificacion) {
    const error = new Error("No existe una notificación para esta denuncia");
    error.name = "NoExisteNotificacion";
    throw error;
  }

  // Buscar todas las citaciones asociadas a la denuncia
  const citaciones = await Notificacion.findAll({
    where: { idDenuncia: id },
    attributes: ['idUsuario','diriguidoA', 'parte']
  });
  if (!citaciones || citaciones.length === 0) return [];
  // Devuelve un array de objetos con los nombres de las personas citadas y el campo parte
  const notificados = citaciones.map(citacion => ({
    idUsuario: citacion.idUsuario,
    personasNotificadas: citacion.diriguidoA,
    parte: citacion.parte
  }));
   const resultado = [];
    for (const persona of notificados) {
      // Busca citacion con diriguidoA igual al nombre completo
      const citado = await Citacion.findOne({
        where: { idDenuncia: id, diriguidoA: persona.personasNotificadas }
      });
      resultado.push({
        ...persona,
        estado: citado ? 'Citado' : 'Por citar'
      });
    }

  return resultado;

} 
// secivio para obtener los datos para la citacion 
export async function citacionesDTO(id:string) {
   const resultado = await Denuncia.findByPk(id, {
  attributes: ['codigoTramite'],
  include: [
  {
    model: Canton,
    attributes:['canton'],
    as: "canton"

  }
], 
  
});

const { codigoTramite, canton:can } = resultado as any;
  

const respuestaFormateada = {
  codigoTramite,
  Canton: can?.canton || ''
};

return respuestaFormateada



    
}
//servicio para crear una citacion
export async function crearcitacion(data:any) {
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
        estatus: 'completada',
        idUsuario: data.idUsuario
        

        

      }, { transaction: t });
    

    await t.commit();
    return citacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
//funcion para actualizar una citacion
export async function actualizarCitacion(id: string, data: any){
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
      diriguidoA: data.diriguidoA,
      estatus: data.estatus || 'completada',
      idUsuario: data.idUsuario
    }, { transaction: t });
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
   // Obtener el canton desde la denuncia relacionada
    let canton = '';
    if (citacion.idDenuncia) {
      const denuncia = await Denuncia.findByPk(citacion.idDenuncia, {
        include: [{ model: Canton, as: 'canton', attributes: ['canton'] }]
      });
      canton = (denuncia as any)?.canton?.canton || '';
    }
  return {
    idDenuncia: citacion.idDenuncia,
    codigoTramite: citacion.codigoTramite,
    fecha: citacion.fecha,
    hora: citacion.hora,
    direccion: citacion.direccion,
    local: citacion.local,
    parte: citacion.parte,
    diriguidoA: citacion.diriguidoA,
    estatus: citacion.estatus,
    idUsuario: citacion.idUsuario,
    fechaCreado: (citacion as any).fechaCreado,
    canton

  };
}
