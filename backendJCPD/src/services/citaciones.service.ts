


import sequelize from "../config/database";
import {  Avocatoria, Canton, Denuncia, Denunciado, Denunciante, Otros } from "../models";
import { Citacion } from "../models/citaciones.model";


export  async function  personasCitacion(id:string){
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
    console.log(personas)

    return personas

} 
export async function citacionesDTO(id:string) {
   const resultado = await Denuncia.findByPk(id, {
  attributes: ['codigoTramite'],
  include: [
  {
    model: Canton,
    attributes:['canton']

  }
], 
  
});

const { codigoTramite, Canton:can } = resultado as any;
  

const respuestaFormateada = {
  codigoTramite,
  Canton: can?.canton || ''
};

return respuestaFormateada



    
}

export async function crearcitacion(data:any) {
  const t = await sequelize.transaction();
  try {
      await Citacion.create({
        idDenuncia: data.idDenuncia,
        codigoTramite: data.codigoTramite,
        fecha: data.fecha,
        hora: data.hora,
        direccion: data.direccion,
        local: data.local,
        parte: data.parte,
        diriguidoA: data.diriguidoA,
        estatus: 'completada',
        

        

      }, { transaction: t });
    

    await t.commit();
    return { success: true };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}