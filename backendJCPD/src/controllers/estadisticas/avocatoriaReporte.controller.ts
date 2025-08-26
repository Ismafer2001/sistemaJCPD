import { contarAvocatorias, contarMedidasAgrupadasPorArticulo, contarMedidasEmergentes, vulneracionesagrupadas } from "../../services/estadisticas/avocatoriaReporte.service";

import { Request, Response } from 'express';

export const getavocatoriaReporte = async (req: Request, res: Response) => {
  try {
    const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user?.id_canton,
      desde: req.query.desdeas as string,
      hasta: req.query.hasta as string,
    };

    // 👇 Este dato viene del usuario autenticado (por ejemplo, desde el token)
    

    if (!req.query.grupoPrioritario) {
  return res.status(400).json({ error: 'Falta el parámetro grupoPrioritario' });
}


     const [avocatoria,medidasEmergentes] = await Promise.all([
      contarAvocatorias(filtros),
      contarMedidasEmergentes(filtros),
      
      
      
    ]);

      return res.json({
      avocatoria,
      medidasEmergentes,
      
    });

  } catch (error) {
    console.error('Error ', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMedidasAgrupadasPorArticulo = async (req: Request, res: Response) => {
  try {
    const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user?.id_canton,
      desde: req.query.desdeas as string,
      hasta: req.query.hasta as string,
    };

    // 👇 Este dato viene del usuario autenticado (por ejemplo, desde el token)
    

    if (!req.query.grupoPrioritario) {
  return res.status(400).json({ error: 'Falta el parámetro grupoPrioritario' });
}


     const  MedidasAgrupadasPorArticulo  = await contarMedidasAgrupadasPorArticulo(filtros)
      
    

      return res.json(
      MedidasAgrupadasPorArticulo
    );

  } catch (error) {
    console.error('Error al obtener medidas agrupadas por artículo:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getVulneracionesAgrupadas = async (req: Request, res: Response) => {
  try {
    const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user?.id_canton,
      desde: req.query.desdeas as string,
      hasta: req.query.hasta as string,
    };

    if (!req.query.grupoPrioritario) {
      return res.status(400).json({ error: 'Falta el parámetro grupoPrioritario' });
    }

    const vulneraciones = await vulneracionesagrupadas(filtros);

    return res.json(vulneraciones);
  } catch (error) {
    console.error('Error al obtener vulneraciones agrupadas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};