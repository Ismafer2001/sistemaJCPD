import { group } from 'console';
import { Afectado, Denuncia } from '../../models';
import { col, fn, Op } from 'sequelize';

interface FiltroReporte {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
   // opcional, por si después querés filtrar por estado
}

export const obtenerResumenDenuncias = async (filtros: {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}) => {
  const baseWhere: any = {
    grupoPrioritario: filtros.grupoPrioritario,
    id_canton: filtros.id_canton
  };
  console.log('Base Where:', filtros.desde);
  // normalizar filtros de fecha: usar límites UTC para evitar desplazamientos por zona horaria
  if (filtros.desde || filtros.hasta) {
    let desdeDate: Date | undefined;
    let hastaDate: Date | undefined;
    

    if (filtros.desde) {
      desdeDate = new Date(filtros.desde);
      desdeDate.setUTCHours(0, 0, 0, 0);
      
    }

    if (filtros.hasta) {
      hastaDate = new Date(filtros.hasta);
      hastaDate.setUTCHours(23, 59, 59, 999);
    }

    if (desdeDate && hastaDate) {
      baseWhere.fechaCreado = { [Op.between]: [desdeDate, hastaDate] };
    } else if (desdeDate) {
      baseWhere.fechaCreado = { [Op.gte]: desdeDate };
    } else if (hastaDate) {
      baseWhere.fechaCreado = { [Op.lte]: hastaDate };
    }
  }
  

  const totalDenuncias = await Denuncia.count({ where: baseWhere  });

  const totalPorOficio = await Denuncia.count({
    where: {
      ...baseWhere,
      tipo_denuncia: 'oficio'
    }
  });

  const totalPorExterno = await Denuncia.count({
    where: {
      ...baseWhere,
      tipo_denuncia: 'externa'
    }
  });
  const totalAfectados = await Afectado.count({
    
    include: [
      {
        model: Denuncia ,
        
        where: baseWhere
      }
    ]
  });

  return {
    totalDenuncias,
    totalPorOficio,
    totalPorExterno,
    totalAfectados
  };
};
export const contarAfectadosPorSexo = async (filtros: {
  grupoPrioritario: string;
  id_canton: number;
  desde?: string;
  hasta?: string;
}) => {
  const whereDenuncia: any = {
    grupoPrioritario: filtros.grupoPrioritario,
    id_canton: filtros.id_canton
  };

  // normalizar filtros de fecha
  if (filtros.desde || filtros.hasta) {
    let desdeDate: Date | undefined;
    let hastaDate: Date | undefined;
    if (filtros.desde) {
      desdeDate = new Date(filtros.desde);
      desdeDate.setUTCHours(0, 0, 0, 0);
    }
    if (filtros.hasta) {
      hastaDate = new Date(filtros.hasta);
      hastaDate.setUTCHours(23, 59, 59, 999);
    }
    if (desdeDate && hastaDate) {
      whereDenuncia.fechaCreado = { [Op.between]: [desdeDate, hastaDate] };
    } else if (desdeDate) {
      whereDenuncia.fechaCreado = { [Op.gte]: desdeDate };
    } else if (hastaDate) {
      whereDenuncia.fechaCreado = { [Op.lte]: hastaDate };
    }
  }

  const resultado = await Afectado.findAll({
    attributes: ['sexo', [fn('COUNT', col('Afectado.id')), 'cantidad']],
    include: [
      {
        model: Denuncia,
        attributes: [], 
        where: whereDenuncia
      }
    ],
    group: ['sexo']
  });

  // Convertimos el resultado a un objeto más legible
  const conteo: Record<string, number> = {};
  for (const r of resultado) {
    const sexo = (r.get('sexo') as string)?.toLowerCase() || 'desconocido';
    conteo[sexo] = parseInt(r.get('cantidad') as string, 10);
  }

  return conteo;
};

export const contarAfectadosPorEdad = async (filtros: FiltroReporte) => {
  const whereDenuncia: any = {
    grupoPrioritario: filtros.grupoPrioritario,
    id_canton: filtros.id_canton
  };

  // normalizar filtros de fecha
  if (filtros.desde || filtros.hasta) {
    let desdeDate: Date | undefined;
    let hastaDate: Date | undefined;
    if (filtros.desde) {
      desdeDate = new Date(filtros.desde);
      desdeDate.setUTCHours(0, 0, 0, 0);
    }
    if (filtros.hasta) {
      hastaDate = new Date(filtros.hasta);
      hastaDate.setUTCHours(23, 59, 59, 999);
    }
    if (desdeDate && hastaDate) {
      whereDenuncia.fechaCreado = { [Op.between]: [desdeDate, hastaDate] };
    } else if (desdeDate) {
      whereDenuncia.fechaCreado = { [Op.gte]: desdeDate };
    } else if (hastaDate) {
      whereDenuncia.fechaCreado = { [Op.lte]: hastaDate };
    }
  }

  const rangos = [
    { label: '0-1', min: 0, max: 1 },
    { label: '1-3', min: 1, max: 3 },
    { label: '3-5', min: 3, max: 5 },
    { label: '5-8', min: 5, max: 8 },
    { label: '8-12', min: 8, max: 12 },
    { label: '12-15', min: 12, max: 15 },
    { label: '15-18', min: 15, max: 18 }
  ];

  const resultados: Record<string, number> = {};

  for (const rango of rangos) {
    const cantidad = await Afectado.count({
      where: {
        edad: { [Op.between]: [rango.min, rango.max] }
      },
      include: [{
        model: Denuncia,
        attributes: [],
        where: whereDenuncia
      }]
    });

    resultados[rango.label] = cantidad;
  }

  return resultados;
};
export const contarAfectadosPorNacionalidad = async (filtros: FiltroReporte) => {
  const whereDenuncia: any = {
    grupoPrioritario: filtros.grupoPrioritario,
    id_canton: filtros.id_canton
  };

  // normalizar filtros de fecha
  if (filtros.desde || filtros.hasta) {
    let desdeDate: Date | undefined;
    let hastaDate: Date | undefined;
    if (filtros.desde) {
      desdeDate = new Date(filtros.desde);
      desdeDate.setUTCHours(0, 0, 0, 0);
    }
    if (filtros.hasta) {
      hastaDate = new Date(filtros.hasta);
      hastaDate.setUTCHours(23, 59, 59, 999);
    }
    if (desdeDate && hastaDate) {
      whereDenuncia.fechaCreado = { [Op.between]: [desdeDate, hastaDate] };
    } else if (desdeDate) {
      whereDenuncia.fechaCreado = { [Op.gte]: desdeDate };
    } else if (hastaDate) {
      whereDenuncia.fechaCreado = { [Op.lte]: hastaDate };
    }
  }

  const resultado = await Afectado.findAll({
    attributes: ['nacionalidad', [fn('COUNT', col('Afectado.id')), 'cantidad']],
    include: [{
      model: Denuncia,
      attributes: [],
      where: whereDenuncia
    }],
    group: ['nacionalidad']
  });

  const conteo: Record<string, number> = {};
  for (const r of resultado) {
    const nacionalidad = (r.get('nacionalidad') as string)?.toLowerCase() || 'desconocido';
    conteo[nacionalidad] = parseInt(r.get('cantidad') as string, 10);
  }

  return conteo;
};