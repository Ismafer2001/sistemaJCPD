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

  if (filtros.desde) {
    whereAvocatoria.fechaCreado = { [Op.gte]: new Date(filtros.desde) };
  }

  if (filtros.hasta) {
    const hasta = new Date(filtros.hasta);
    
    whereAvocatoria.fechaCreado = {
      ...(whereAvocatoria.fechaCreado || {}),
      [Op.lte]: hasta
    };
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

   const whereAvocatoria: any = {};

  if (filtros.desde) {
    whereAvocatoria.fechaCreado = { [Op.gte]: new Date(filtros.desde) };
  }

  if (filtros.hasta) {
    const hasta = new Date(filtros.hasta);
    hasta.setHours(23, 59, 59, 999);
    whereAvocatoria.fechaCreado = {
      ...(whereAvocatoria.fechaCreado || {}),
      [Op.lte]: hasta
    };
  }

  const total = await MedidasEmergentes.count({
    include: [
      
      {
        model: Afectado,
        
        required: true,
        include: [{
          model: Denuncia,
          
          attributes: [],
          where: whereDenuncia,
          include: [
              {
                model: Avocatoria,
                as:'avocatoria',
                required: true,
                attributes: [],
                where: whereAvocatoria
              }
            ]
        }
      ]
      }
    ]
  });

  return total;
};


export const contarMedidasAgrupadasPorArticulo = async (filtro: FiltroAvocatoria) => {
  const whereFechaAvocatoria: any = {};
  if (filtro.desde) {
    whereFechaAvocatoria.fechaCreado = { [Op.gte]: new Date(filtro.desde) };
  }
  if (filtro.hasta) {
    const hasta = new Date(filtro.hasta);
    hasta.setHours(23, 59, 59, 999);
    whereFechaAvocatoria.fechaCreado = {
      ...(whereFechaAvocatoria.fechaCreado || {}),
      [Op.lte]: hasta
    };
  }

  const resultado = await MedidasEmergentes.findAll({
    attributes: [
      [fn('COUNT', col('MedidasEmergentes.id')), 'cantidad']
    ],
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
            },
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
  if (filtro.desde) {
    whereFechaAvocatoria.fechaCreado = { [Op.gte]: new Date(filtro.desde) };
  }
  if (filtro.hasta) {
    const hasta = new Date(filtro.hasta);
    hasta.setHours(23, 59, 59, 999);
    whereFechaAvocatoria.fechaCreado = {
      ...(whereFechaAvocatoria.fechaCreado || {}),
      [Op.lte]: hasta
    };
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

