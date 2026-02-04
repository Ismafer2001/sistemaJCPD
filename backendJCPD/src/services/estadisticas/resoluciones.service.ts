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
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereResoluciones.fecha_creado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereResoluciones.fecha_creado = { [Op.gte]: desde };
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereResoluciones.fecha_creado = { [Op.lte]: hasta };
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
  const whereFechaMedidas: any = {};
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereFechaMedidas.FechaCreado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereFechaMedidas.FechaCreado = { [Op.gte]: desde };
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereFechaMedidas.FechaCreado = { [Op.lte]: hasta };
  }

  // Consulta para medidas agrupadas
  const resultado = await MedidasDefinitivas.findAll({
    attributes: [
      [fn('COUNT', col('MedidasDefinitivas.id')), 'cantidad']
    ],
    where: whereFechaMedidas,
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
            }
          }
        ]
      },
      
    ],
  // usar alias de include para GROUP BY compatible con Sequelize/MySQL
  group: ['MedidasD.id', 'MedidasD.medidas', 'MedidasD->articulo.id', 'MedidasD->articulo.articulo'],
    raw: true,
    nest: true
  });

  // Contar afectados únicos
  const totalAfectados = await MedidasDefinitivas.count({
    distinct: true,
    col: 'idAfectado',
    where: whereFechaMedidas,
    include: [
      {
        model: Afectado,
        required: true,
        include: [
          {
            model: Denuncia,
            required: true,
            where: {
              grupoPrioritario: filtro.grupoPrioritario,
              id_canton: filtro.id_canton
            },
           
          }
        ]
      }
    ]
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

  return {
    medidas: resumen,
    totalAfectadosConMedidasDefinitivas: totalAfectados
  };
};
