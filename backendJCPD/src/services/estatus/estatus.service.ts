import { AudienciaContestacion, AudienciaPruebas, Avocatoria, Denuncia, Notificacion } from "../../models";
import { Citacion } from "../../models/citaciones.model";


export async function estatus(id:string) {
    const estado = await Denuncia.findByPk(id, {
        attributes: [
            'estatus'
        ],include:[
            {
                model: Avocatoria,
                attributes: ['estatus'],
            },
            {
                model: Citacion,
                attributes: ['estatus'],
                limit: 1, 
            },
            {
                model: Notificacion,
                attributes: ['estatus'],
                limit: 1, 
            },
            {
                model: AudienciaContestacion,
                attributes: ['estatus'],
                as:"ac" ,
                
            },
            {
                model:AudienciaPruebas,
                attributes: ['estatus'],
                as:"ap" ,
                
            }
        ]

    });
    if (!estado) return null;
    const estadoPlano = estado as any;

  // Desestructurar los estatus
  const respuestaFormateada = {
    denuncia: estadoPlano.estatus || '',
    avocatoria: estadoPlano.Avocatorium?.estatus || '',
    citacion: estadoPlano.Citacions?.[0]?.estatus || '',
    notificacion: estadoPlano.Notificacions?.[0]?.estatus || '',
    audienciaC: estadoPlano.ac?.estatus || '',
    audienciaP: estadoPlano.ap?.estatus || '',
  };
  console.log(respuestaFormateada);
    return respuestaFormateada;


    
}