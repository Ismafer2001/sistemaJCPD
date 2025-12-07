import { Denuncia } from '../../models';
import { Op } from 'sequelize';
import { AudienciaPruebas } from '../../models/audiencia_prueba.model';

interface FiltroReporte {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

/**
 * Devuelve un resumen con el total de audiencias de pruebas y el total
 * asociadas a denuncias de tipo 'oficio' y 'externa'.
 */
export async function contarAudienciasPruebasTotales(filtro: FiltroReporte) {
  const whereDenuncia: any = {
    grupoPrioritario: filtro.grupoPrioritario,
    id_canton: filtro.id_canton,
  };

  const whereAudiencia: any = {};
  if (filtro.desde) {
    whereAudiencia.fecha_creado = { [Op.gte]: new Date(filtro.desde) };
  }
  if (filtro.hasta) {
    const hasta = new Date(filtro.hasta);
    hasta.setHours(23, 59, 59, 999);
    whereAudiencia.fecha_creado = {
      ...(whereAudiencia.fecha_creado || {}),
      [Op.lte]: hasta,
    };
  }

  // Total audiencias de pruebas (filtrando por denuncia -> canton y grupo)
  const total = await AudienciaPruebas.count({
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

  // Audiencias de pruebas asociadas a denuncias por oficio
  const oficio = await AudienciaPruebas.count({
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

  // Audiencias de pruebas asociadas a denuncias por externa
  const externa = await AudienciaPruebas.count({
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
