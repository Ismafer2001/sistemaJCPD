import { Op } from "sequelize";
import { ControlImpugnacion } from "../../models/controlImpugnacion.model";

import { Denuncia } from "../../models/denuncia.models";
import { Resoluciones } from "../../models";

export interface FiltroImpugnacion {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

export const contarTotalPorReposicionYApelacion = async (filtro: FiltroImpugnacion) => {
  const whereFecha: any = {};
  console.log('filtro recibido en el servicio de impugnacion', filtro);
  
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
  console.log('whereFecha construido:', whereFecha);

  // Contar reposiciones
  
  const reposiciones = await ControlImpugnacion.count({
    where: {
      ...whereFecha,
      recurso_impugnacion: 'reposicion'
    },
    include: [
      {
        model: Resoluciones,
        required: true,
        as: "Resolucion",
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
  console.log('Conteo de reposiciones realizado:', reposiciones);

  // Contar apelaciones
  const apelaciones = await ControlImpugnacion.count({
    where: {
      ...whereFecha,
      recurso_impugnacion: 'apelacion'
    },
    include: [
      {
        model: Resoluciones,
        required: true,
        as: "Resolucion",
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
    reposiciones,
    apelaciones
  };
};