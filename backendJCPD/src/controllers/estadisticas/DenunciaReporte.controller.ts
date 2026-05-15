import { contarAfectadosPorEdad, contarAfectadosPorNacionalidad, contarAfectadosPorSexo, obtenerResumenDenuncias } from "../../services/estadisticas/denunciaReportes.service";
import { Request, Response } from 'express';

export const getDenunciasTotales = async (req: Request, res: Response) => {
  try {
    
    const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user.id_canton!,
      desde: req.query.desde as string,
      hasta: req.query.hasta as string,
    };

    // 👇 Este dato viene del usuario autenticado (por ejemplo, desde el token)
    

    if (!req.query.grupoPrioritario) {
  return res.status(400).json({ error: 'Falta el parámetro grupoPrioritario' });
}




     const [resumen, afectadosPorSexo,AfectadosPorEdad,afectadosPorNacionalidad] = await Promise.all([
      obtenerResumenDenuncias(filtros),
      contarAfectadosPorSexo(filtros),
      contarAfectadosPorEdad(filtros),
      contarAfectadosPorNacionalidad(filtros)
    ]);

      return res.json({
      ...resumen,
      afectadosPorSexo,
      AfectadosPorEdad,
      afectadosPorNacionalidad
    });

  } catch (error) {
    console.error('Error al contar denuncias totales:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};