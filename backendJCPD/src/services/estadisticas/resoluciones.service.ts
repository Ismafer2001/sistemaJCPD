import { Afectado, articulo, Denuncia, medida, MedidasDefinitivas } from '../../models';
import { col, fn, Op } from 'sequelize';
import { Resoluciones } from '../../models/resoluciones.models';

interface FiltroReporte {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

/**
 * Devuelve un resumen con el total de resoluciones y el total
 * asociadas a denuncias de tipo 'oficio' y 'externa'.
 */
export async function contarResolucionesTotales(filtro: FiltroReporte) {
  const whereDenuncia: any = {
    grupoPrioritario: filtro.grupoPrioritario,
    id_canton: filtro.id_canton,
  };

  const whereResoluciones: any = {};
  if (filtro.desde) {
    whereResoluciones.fecha_creado = { [Op.gte]: new Date(filtro.desde) };
  }
  if (filtro.hasta) {
    const hasta = new Date(filtro.hasta);
    hasta.setHours(23, 59, 59, 999);
    whereResoluciones.fecha_creado = {
      ...(whereResoluciones.fecha_creado || {}),
      [Op.lte]: hasta,
    };
  }

  // Total resoluciones (filtrando por denuncia -> canton y grupo)
  const total = await Resoluciones.count({
    where: whereResoluciones,
    include: [
      {
        model: Denuncia,
        required: true,
        attributes: [],
        where: whereDenuncia,
      },
    ],
  });

  // Resoluciones asociadas a denuncias por oficio
  const oficio = await Resoluciones.count({
    where: whereResoluciones,
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

  // Resoluciones asociadas a denuncias por externa
  const externa = await Resoluciones.count({
    where: whereResoluciones,
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

export const contarMedidasDefinitivasAgrupadasPorArticulo = async (filtro: FiltroReporte) => {
  const whereFecha: any = {};
  if (filtro.desde) {
    whereFecha.fechaCreado = { [Op.gte]: new Date(filtro.desde) };
  }
  if (filtro.hasta) {
    const hasta = new Date(filtro.hasta);
    hasta.setHours(23, 59, 59, 999);
    whereFecha.fechaCreado = {
      ...(whereFecha.fechaCreado || {}),
      [Op.lte]: hasta
    };
  }

  const resultado = await MedidasDefinitivas.findAll({
    attributes: [
      [fn('COUNT', col('MedidasDefinitivas.id')), 'cantidad']
    ],
    include: [
      {
        model: medida,
        as: "MedidasD" ,
    attributes: ['id','medidas'],
        include: [
          {
      model: articulo,
      attributes: ['id','articulo']
          }
        ]
      },
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
            },
            include: [
              {
                model: Resoluciones,
                as:"resoluciones",
                required: true,
                attributes: [],
                where: whereFecha
              }
            ]
          }
        ]
      },
      
    ],
  // usar alias de include para GROUP BY compatible con Sequelize/MySQL
  group: ['MedidasD.id', 'MedidasD.medidas', 'MedidasD->articulo.id', 'MedidasD->articulo.articulo'],
    raw: true,
    nest: true
  });

  const resumen: Record<string, Record<string, number>> = {};

  for (const item of resultado) {
    const medidaData = (item as any).MedidasD;
    const articuloNombreRaw = (medidaData?.articulo?.articulo || 'Sin artículo').toString().trim();
    const articuloKey = articuloNombreRaw.replace(/\s+/g, '_');
    const nombreMedida = (medidaData?.medidas || 'Medida_desconocida').toString();
    const cantidad = parseInt((item as any).cantidad, 10) || 0;

    if (!resumen[articuloKey]) {
      resumen[articuloKey] = {};
    }

    resumen[articuloKey][nombreMedida] = cantidad;
  }

  console.log("Resumen de medidas agrupadas por artículo:", resumen);

  return resumen;
};
