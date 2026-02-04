import { Op } from "sequelize";
import { CierreCaso } from "../../models/cierreCaso.models";
import { Afectado } from "../../models/afectado.models";
import { Denuncia } from "../../models/denuncia.models";

export interface FiltroCierreCaso {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

export const contarCierreCasosTotales = async (filtro: FiltroCierreCaso) => {
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

  const totalCierreCasos = await CierreCaso.count({
    where: whereFecha,
    include: [
      {
        
            model: Denuncia,
            required: true,
            as: "DenunciaCierre",
            attributes: [],
            where: {
              grupoPrioritario: filtro.grupoPrioritario,
              id_canton: filtro.id_canton
            }
          
      }
    ]
  });

  return {
    totalCierreCasos
  };
};