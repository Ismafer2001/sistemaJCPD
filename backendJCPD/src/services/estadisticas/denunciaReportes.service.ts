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
  console.log('Base Where after date filter:', baseWhere);
  

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
    group: ['Afectado.sexo'],
    raw: true
  });

  // Convertimos el resultado a un objeto más legible
  const conteo: Record<string, number> = {};
  for (const r of resultado) {
    const sexo = (r.get('sexo') as string)?.toLowerCase() || 'otro';
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

  const resultado = await Afectado.findAll({
    attributes: ['edad', [fn('COUNT', col('Afectado.id')), 'cantidad']],
    include: [{
      model: Denuncia,
      attributes: [],
      where: whereDenuncia
    }],
    group: ['Afectado.edad'],
    order: [['edad', 'ASC']],
    raw: true
  });

  const conteo: Record<string, number> = {};
  for (const r of resultado) {
    const edad = r.get('edad') as number;
    const edadKey = edad !== null && edad !== undefined ? edad.toString() : 'sin_edad';
    conteo[edadKey] = parseInt(r.get('cantidad') as string, 10);
  }

  return conteo;
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
    group: ['Afectado.nacionalidad'],
    raw: true
  });

  const conteo: Record<string, number> = {};
  for (const r of resultado) {
    const nacionalidad = (r.get('nacionalidad') as string)?.toLowerCase() || 'desconocido';
    conteo[nacionalidad] = parseInt(r.get('cantidad') as string, 10);
  }

  return conteo;
};