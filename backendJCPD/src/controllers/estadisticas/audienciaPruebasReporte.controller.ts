import { Request, Response } from 'express';
import { contarAudienciasPruebasTotales } from '../../services/estadisticas/audienciaPruebasReporte.service';
import { handlehttp } from '../../utils/error.handle';

export const getAudienciasPruebasTotales = async (req: Request, res: Response) => {
  try {
    const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user?.id_canton!,
      desde: req.query.desde as string,
      hasta: req.query.hasta as string,
    };

    // 👇 Este dato viene del usuario autenticado (por ejemplo, desde el token)
    
    if (!req.query.grupoPrioritario) {
      return res.status(400).json({ error: 'Falta el parámetro grupoPrioritario' });
    }

    const resumen = await contarAudienciasPruebasTotales(filtros);

    return res.json(resumen);

  } catch (error) {
    handlehttp(res, 'ERROR_GET_AUDIENCIAS_PRUEBAS_TOTALES', error);
  }
};
