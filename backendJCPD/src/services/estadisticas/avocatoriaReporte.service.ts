import { Afectado, Avocatoria, Denuncia, MedidasEmergentes, medida, articulo, VulneracionesIdentificadas, Vulneracion } from '../../models';
import { Op,fn, col } from 'sequelize';


interface FiltroAvocatoria {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}

export const contarAvocatorias = async (filtros: FiltroAvocatoria) => {
  const whereDenuncia: any = {
    grupoPrioritario: filtros.grupoPrioritario,
    id_canton: filtros.id_canton
  };
   const whereAvocatoria: any = {};

  if (filtros.desde && filtros.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtros.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtros.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereAvocatoria.fechaCreado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtros.desde) {
    // Solo fecha desde
    const desde = new Date(filtros.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereAvocatoria.fechaCreado = { [Op.gte]: desde };
  } else if (filtros.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtros.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereAvocatoria.fechaCreado = { [Op.lte]: hasta };
  }

  const totalAvocatorias = await Avocatoria.count({
    where: whereAvocatoria,
    include: [{
      model: Denuncia,
      as: "denunciaAvocatoria",
      
      attributes: [],
      where: whereDenuncia
    }]
  });
  console.log("Total de avocatorias:", totalAvocatorias);

  return totalAvocatorias;
};
export const contarMedidasEmergentes = async (filtros: FiltroAvocatoria) => {
  const whereDenuncia: any = {
    grupoPrioritario: filtros.grupoPrioritario,
    id_canton: filtros.id_canton
  };

  const whereFechaMedidas: any = {};

  if (filtros.desde && filtros.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtros.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtros.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereFechaMedidas.fechaCreado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtros.desde) {
    // Solo fecha desde
    const desde = new Date(filtros.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereFechaMedidas.fechaCreado = { [Op.gte]: desde };
  } else if (filtros.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtros.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereFechaMedidas.fechaCreado = { [Op.lte]: hasta };
  }

  const total = await MedidasEmergentes.count({
    where: whereFechaMedidas,
    include: [
      {
        model: Afectado,
        required: true,
        include: [{
          model: Denuncia,
          attributes: [],
          where: whereDenuncia
        }]
      }
    ]
  });
  console.log("Total de medidas emergentes:", total);

  return total;
};


export const contarMedidasAgrupadasPorArticulo = async (filtro: FiltroAvocatoria) => {
  const whereFechaMedidas: any = {};
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereFechaMedidas.fechaCreado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereFechaMedidas.fechaCreado = { [Op.gte]: desde };
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereFechaMedidas.fechaCreado = { [Op.lte]: hasta };
  }

  const resultado = await MedidasEmergentes.findAll({
    attributes: [
      [fn('COUNT', col('MedidasEmergentes.id')), 'cantidad']
    ],
    where: whereFechaMedidas,
    include: [
      {
        model: medida,
        as: "Med" ,
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
  group: ['Med.id', 'Med.medidas', 'Med->articulo.id', 'Med->articulo.articulo'],
    raw: true,
    nest: true
  });

  const resumen: Record<string, Record<string, number>> = {};

  for (const item of resultado) {
    const medidaData = (item as any).Med;
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

export async function vulneracionesagrupadas(filtro: FiltroAvocatoria) {
  const whereFechaAvocatoria: any = {};
  
  if (filtro.desde && filtro.hasta) {
    // Si hay ambas fechas, crear rango inclusivo
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0); // Inicio del día
    
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999); // Final del día
    
    whereFechaAvocatoria.fechaCreado = {
      [Op.between]: [desde, hasta]
    };
  } else if (filtro.desde) {
    // Solo fecha desde
    const desde = new Date(filtro.desde);
    desde.setUTCHours(0, 0, 0, 0);
    whereFechaAvocatoria.fechaCreado = { [Op.gte]: desde };
  } else if (filtro.hasta) {
    // Solo fecha hasta
    const hasta = new Date(filtro.hasta);
    hasta.setUTCHours(23, 59, 59, 999);
    whereFechaAvocatoria.fechaCreado = { [Op.lte]: hasta };
  }

  const whereDenuncia: any = {
    grupoPrioritario: filtro.grupoPrioritario,
    id_canton: filtro.id_canton
  };

  const resultado = await VulneracionesIdentificadas.findAll({
    attributes: [[fn('COUNT', col('VulneracionesIdentificadas.id')), 'cantidad']],
    include: [
      {
        model: Vulneracion,
        as: "vulneracion",
        attributes: ['id', 'vulneracion']
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
            where: whereDenuncia,
            include: [
              {
                model: Avocatoria,
                as:'avocatoria',
                required: true,
                attributes: [],
                where: whereFechaAvocatoria
              }
            ]
          }
        ]
      }
    ],
    group: ['Vulneracion.id', 'Vulneracion.vulneracion'],
    raw: true,
    nest: true
  });

  const resumen: Record<string, number> = {};
  for (const item of resultado) {
    const vul = (item as any).Vulneracion || (item as any).vulneracion;
    const nombre = vul?.vulneracion || 'Sin vulneración';
    const cantidad = parseInt((item as any).cantidad, 10) || 0;
    resumen[nombre] = (resumen[nombre] || 0) + cantidad;
  }

  return resumen;
}

