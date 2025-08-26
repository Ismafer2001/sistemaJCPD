
import { Notificacion } from "../models";
import sequelize from "../config/database";

export interface NotificacionDTO {
  idDenuncia: number;
  codigoTramite: string;
  fecha: Date;
  parte: string;
  diriguidoA: string;
  direccion: string;
  estatus: "pendiente"|"en_proceso"|"completada";
  
}

export async function crearNotificacion(data: NotificacionDTO) {
  const t = await sequelize.transaction();
  try {
      const notificacion =await Notificacion.create({
        idDenuncia: data.idDenuncia,
        codigoTramite: data.codigoTramite,
        fecha: data.fecha,
        parte: data.parte,
        diriguidoA: data.diriguidoA,
        direccion: data.direccion,
        estatus: 'completada',

      }, { transaction: t });
    

    await t.commit();
    return notificacion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}


import {  Avocatoria, Canton, Denuncia, Denunciado, Denunciante, Otros } from "../models";


export  async function  personasNotificacion(id:string){
     const personas = await Denuncia.findByPk(id,{
      
      include: [
        {
          model: Denunciante,
          attributes:['nombres']
          
         
        },
        {
          model: Denunciado,
           attributes:['nombres']
          
          
        },
        
        {
          model: Otros,
           attributes:['nombres','parte'],
           as:'otros'
          
          
          
        }
      ],
      attributes: [] 
    });
    

    return personas

} 
export async function notifiacionesDTO(id:string) {
   const resultado = await Denuncia.findByPk(id, {
  attributes: ['codigoTramite'],
  include: [{
    model: Avocatoria,
    attributes: ['fechaCreado']

  },
  {
    model: Canton,
    attributes:['canton']

  }
], 
  
});


const { codigoTramite, Avocatorium:avo, Canton:can } = resultado as any;
  
console.log("Resultado de la consulta:", resultado);
const respuestaFormateada = {
  codigoTramite,

  fechaCreado: avo?.fechaCreado || '',
  Canton: can?.canton || ''
};

return respuestaFormateada



    
}

