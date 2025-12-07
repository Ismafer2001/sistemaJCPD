import { Request, Response } from 'express';
import { contarResolucionesTotales, contarMedidasDefinitivasAgrupadasPorArticulo } from '../../services/estadisticas/resoluciones.service';
import { handlehttp } from '../../utils/error.handle';

export const getResolucionesTotales = async (req: Request, res: Response) => {
  try {
    const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user?.id_canton,
      desde: req.query.desde as string,
      hasta: req.query.hasta as string,
    };

    // 👇 Este dato viene del usuario autenticado (por ejemplo, desde el token)
    
    if (!req.query.grupoPrioritario) {
      return res.status(400).json({ error: 'Falta el parámetro grupoPrioritario' });
    }

    const resumen = await contarResolucionesTotales(filtros);

    return res.json(resumen);

  } catch (error) {
    handlehttp(res, 'ERROR_GET_RESOLUCIONES_TOTALES', error);
  }
};

export const getMedidasDefinitivasAgrupadasPorArticulo = async (req: Request, res: Response) => {
  try {
    const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user?.id_canton,
      desde: req.query.desde as string,
      hasta: req.query.hasta as string,
    };

    // 👇 Este dato viene del usuario autenticado (por ejemplo, desde el token)
    
    if (!req.query.grupoPrioritario) {
      return res.status(400).json({ error: 'Falta el parámetro grupoPrioritario' });
    }

    const resumen = await contarMedidasDefinitivasAgrupadasPorArticulo(filtros);

    return res.json(resumen);

  } catch (error) {
    handlehttp(res, 'ERROR_GET_MEDIDAS_AGRUPADAS_POR_ARTICULO', error);
  }
};
