import { Op } from "sequelize";
import { Desestimiento } from "../../models/desestimiento.models";
import { Afectado } from "../../models/afectado.models";
import { Denuncia } from "../../models/denuncia.models";

export interface FiltroDesestimiento {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

export const contarDesestimientosAprobados = async (filtro: FiltroDesestimiento) => {
  const whereFecha: any = {};
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereFecha.fechaCreado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereFecha.fechaCreado = { [Op.gte]: desde };
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereFecha.fechaCreado = { [Op.lte]: hasta };
  }

  const totalDesestimientos = await Desestimiento.count({
    where: {
      ...whereFecha,
      resultado_desestimiento: 'si'
    },
    include: [
      {
        
            model: Denuncia,
            required: true,
            as: "DenunciaDes",
            attributes: [],
            where: {
              grupoPrioritario: filtro.grupoPrioritario,
              id_canton: filtro.id_canton
            }
         
      }
    ]
  });

  return {
    totalDesestimientos
  };
};