import { Request, Response } from 'express';
import { medida, articulo } from '../models';

// Obtener todas las medidas con sus artículos
export const getAllMedidas = async (req: Request, res: Response) => {
  try {
    const medidas = await medida.findAll({
      include: [{
        model: articulo,
        
        attributes: ['id', 'articulo']
      }],
      order: [
        ['idArticulo', 'ASC'],
        ['medidas', 'ASC']
      ]
    });

    // Agrupar medidas por artículo
    const medidasPorArticulo = medidas.reduce((acc: any, medida: any) => {
      const articuloId = medida.idArticulo;
      if (!acc[articuloId]) {
        acc[articuloId] = {
          id: medida.articulo.id,
          articulo: medida.articulo.articulo,
          medidas: []
        };
      }
      acc[articuloId].medidas.push({
        id: medida.id,
        medida: medida.medidas
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(medidasPorArticulo)
    });
  } catch (error) {
    console.error('Error al obtener medidas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las medidas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};








// Obtener medidas por ID de artículo
/*export const getMedidasByArticulo = async (req: Request, res: Response) => {
  try {
    const { idArticulo } = req.params;
    const medidas = await medida.findAll({
      where: { idArticulo },
      include: [{
        model: articulo,
        as: 'articulos',
        attributes: ['id', 'articulo']
      }],
      order: [['medidas', 'ASC']]
    });

    if (!medidas.length) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron medidas para este artículo'
      });
    }

    res.json({
      success: true,
      data: {
        articulo: medidas[0].idArticulo,
        medidas: medidas.map(m => ({
          id: m.id,
          medida: m.medidas
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener medidas por artículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las medidas por artículo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};*/

// Obtener medidas identificadas por id de denuncia

