import { Notificacion, Denuncia } from '../../models';
import { Op } from 'sequelize';

interface FiltroReporte {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

/**
 * Devuelve un resumen con el total de notificaciones y el total
 * asociadas a denuncias de tipo 'oficio' y 'externa'.
 */
export async function contarNotificacionesResumen(filtro: FiltroReporte) {
  const whereDenuncia: any = {
    grupoPrioritario: filtro.grupoPrioritario,
    id_canton: filtro.id_canton,
  };

  const whereNotificacion: any = {};
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereNotificacion.fechaCreado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereNotificacion.fechaCreado = { [Op.gte]: desde };
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereNotificacion.fechaCreado = { [Op.lte]: hasta };
  }

  // Total notificaciones (filtrando por denuncia -> canton y grupo)
  const total = await Notificacion.count({
    where: whereNotificacion,
    include: [
      {
        model: Denuncia,
        required: true,
        attributes: [],
        where: whereDenuncia,
      },
    ],
  });

  // Notificaciones asociadas a denuncias por oficio
  const oficio = await Notificacion.count({
    where: whereNotificacion,
    include: [
      {
        model: Denuncia,
        required: true,
        attributes: [],
        where: {
          ...whereDenuncia,
          tipo_denuncia: 'oficio',
        },
      },
    ],
  });

  // Notificaciones asociadas a denuncias por externa
  const externa = await Notificacion.count({
    where: whereNotificacion,
    include: [
      {
        model: Denuncia,
        required: true,
        attributes: [],
        where: {
          ...whereDenuncia,
          tipo_denuncia: 'externa',
        },
      },
    ],
  });

  return { total, oficio, externa };
}


