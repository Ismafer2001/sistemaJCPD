
import { Request, Response } from 'express';

import { contarcitacionesTotales } from '../../services/estadisticas/citacionesReporte.service';

export const getCitacionesTotales = async (req: Request, res: Response) => {
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


     const resumen = await contarcitacionesTotales(filtros);

      return res.json(
      resumen);

  } catch (error) {
    console.error('Error al contar denuncias totales:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};