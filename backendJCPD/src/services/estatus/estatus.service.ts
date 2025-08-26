import { Avocatoria, Denuncia, Notificacion } from "../../models";
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
            }
        ]

    });
    if (!estado) return null;
    const estadoPlano = estado as any;

  // Desestructurar los estatus
  const respuestaFormateada = {
    denuncia: estadoPlano.estatus || '',
    Avocatoria: estadoPlano.Avocatorium?.estatus || '',
    Citacions: estadoPlano.Citacions?.[0]?.estatus || '',
    Notificacions: estadoPlano.Notificacions?.[0]?.estatus || ''
  };
    return respuestaFormateada;


    
}