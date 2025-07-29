

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
    console.log(personas)

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

const { codigoTramite, Avocatoria:avo, Canton:can } = resultado as any;
  

const respuestaFormateada = {
  codigoTramite,

  fechaCreado: avo?.fechaCreado || '',
  Canton: can?.canton || ''
};

return respuestaFormateada



    
}