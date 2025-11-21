import { AudienciaContestacion, AudienciaPruebas, Avocatoria, CumpleMedidas, Denuncia, Notificacion, Resoluciones, Afectado, CierreCaso } from "../../models";
import { Citacion } from "../../models/citaciones.model";
import { ControlImpugnacion } from "../../models/controlImpugnacion.model";


export async function estatus(id:string) {
    const estado = await Denuncia.findByPk(id, {
        attributes: [
            'estatus'
        ],include:[
            {
                model: Avocatoria,
                as: 'avocatoria',
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
                
            },
            {
                model:Resoluciones,
                attributes: ['estatus'],
                as:"resoluciones",
                include: [
                    {
                        model: ControlImpugnacion,
                        as: 'ControlImpugnaciones',
                        attributes: ['estatus'],
                        required: false
                    }
                ]
            },
            {
                model: CierreCaso,
                as: 'CierreCaso',
                attributes: ['estatus'],
                required: false
            }
        ]

    });
    if (!estado) return null;
    const estadoPlano = estado as any;

    // Verificar cumplimiento de medidas para todos los afectados
    const afectados = await Afectado.findAll({
        where: { idDenuncia: id },
        attributes: ['id']
    });

    let cumplimientoMedidas = 'pendiente';
    if (afectados.length > 0) {
        // Verificar si todos los afectados tienen medidas cumplidas
        const verificacionesCumplimiento = await Promise.all(
            afectados.map(async (afectado) => {
                const medidasCompletadas = await CumpleMedidas.findAll({
                    where: { 
                        idAfectado: afectado.id,
                        estatus: 'completada' 
                    }
                });
                
                const medidasTotales = await CumpleMedidas.findAll({
                    where: { idAfectado: afectado.id }
                });

                // Si no tiene medidas asignadas, considerarlo como pendiente
                if (medidasTotales.length === 0) return false;
                
                // Si tiene medidas, verificar que todas tengan estatus 'completada'
                return medidasCompletadas.length === medidasTotales.length;
            })
        );

        // Si todos los afectados tienen sus medidas cumplidas
        const todosCumplen = verificacionesCumplimiento.every(cumple => cumple === true);
        cumplimientoMedidas = todosCumplen ? 'completada' : 'pendiente';
    }

    // Verificar control de impugnación
    let controlImpugnacion = '';
    if (estadoPlano.resoluciones && estadoPlano.resoluciones.length > 0) {
        const resolucion = estadoPlano.resoluciones[0];
        if (resolucion.ControlImpugnaciones && resolucion.ControlImpugnaciones.length > 0) {
            const control = resolucion.ControlImpugnaciones[0];
            controlImpugnacion = control.estatus || '';
        }
    }

  // Desestructurar los estatus
  const respuestaFormateada = {
    denuncia: estadoPlano.estatus || '',
    avocatoria: estadoPlano.avocatoria?.estatus || '',
    citacion: estadoPlano.Citacions?.[0]?.estatus || '',
    notificacion: estadoPlano.Notificacions?.[0]?.estatus || '',
    audienciaC: estadoPlano.ac?.estatus || '',
    audienciaP: estadoPlano.ap?.estatus || '',
    resoluciones: estadoPlano.resoluciones?.[0]?.estatus || '',
    cumplimientoMedidas: cumplimientoMedidas,
    controlImpugnacion: controlImpugnacion,
    cierreCaso: estadoPlano.CierreCaso?.estatus || '',
  };
  console.log(respuestaFormateada);
    return respuestaFormateada;


    
}