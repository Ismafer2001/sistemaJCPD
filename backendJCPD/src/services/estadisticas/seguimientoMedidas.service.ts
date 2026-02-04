import { Op } from "sequelize";
import { CumpleMedidas } from "../../models/cumpleMedidas.models";
import { Afectado } from "../../models/afectado.models";
import { Denuncia } from "../../models/denuncia.models";

export interface FiltroSeguimientoMedidas {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

export const contarMedidasCumplidasYNoCumplidas = async (filtro: FiltroSeguimientoMedidas) => {
  const whereFecha: any = {};
  console.log('entrando a servicio con ');
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereFecha.fechaCreado = {
      [Op.between]: [desde, hasta]
    };
    console.log('Rango de fechas:', { desde, hasta });
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereFecha.fechaCreado = { [Op.gte]: desde };
    console.log('Desde:', desde);
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereFecha.fechaCreado = { [Op.lte]: hasta };
    console.log('Hasta:', hasta);
  }

  // Contar medidas cumplidas
  const medidasCumplidas = await CumpleMedidas.count({
    where: {
      ...whereFecha,
      cumple: true
    },
    include: [
      {
        model: Afectado,
        required: true,
        attributes: [],
        include: [
          {
            model: Denuncia,
            required: true,
            attributes: [],
            where: {
              grupoPrioritario: filtro.grupoPrioritario,
              id_canton: filtro.id_canton
            }
          }
        ]
      }
    ]
  });

  // Contar medidas no cumplidas
  const medidasNoCumplidas = await CumpleMedidas.count({
    where: {
      ...whereFecha,
      cumple: false
    },
    include: [
      {
        model: Afectado,
        required: true,
        attributes: [],
        include: [
          {
            model: Denuncia,
            required: true,
            attributes: [],
            where: {
              grupoPrioritario: filtro.grupoPrioritario,
              id_canton: filtro.id_canton
            }
          }
        ]
      }
    ]
  });

  return {
    medidasCumplidas,
    medidasNoCumplidas,
    desde: filtro.desde || null,
    hasta: filtro.hasta || null
  };
};
