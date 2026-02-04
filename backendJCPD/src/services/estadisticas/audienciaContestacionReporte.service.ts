import { Denuncia } from '../../models';
import { Op } from 'sequelize';
import { AudienciaContestacion } from '../../models/audiencia_constestacion.model';

interface FiltroReporte {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

/**
 * Devuelve un resumen con el total de audiencias de contestación y el total
 * asociadas a denuncias de tipo 'oficio' y 'externa'.
 */
export async function contarAudienciasContestacionTotales(filtro: FiltroReporte) {
  const whereDenuncia: any = {
    grupoPrioritario: filtro.grupoPrioritario,
    id_canton: filtro.id_canton,
  };

  const whereAudiencia: any = {};
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereAudiencia.fecha_creado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereAudiencia.fecha_creado = { [Op.gte]: desde };
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereAudiencia.fecha_creado = { [Op.lte]: hasta };
  }

  // Total audiencias de contestación (filtrando por denuncia -> canton y grupo)
  const total = await AudienciaContestacion.count({
    where: whereAudiencia,
    include: [
      {
        model: Denuncia,
        required: true,
        attributes: [],
        where: whereDenuncia,
      },
    ],
  });

  // Audiencias de contestación asociadas a denuncias por oficio
  const oficio = await AudienciaContestacion.count({
    where: whereAudiencia,
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

  // Audiencias de contestación asociadas a denuncias por externa
  const externa = await AudienciaContestacion.count({
    where: whereAudiencia,
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
