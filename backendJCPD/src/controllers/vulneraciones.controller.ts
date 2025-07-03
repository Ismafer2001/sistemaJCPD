import { Request, Response } from 'express';
import { Vulneracion } from '../models/vulneraciones.models';


  // Obtener todas las vulneraciones
  export const getAllVulneraciones = async(req: Request, res: Response) =>{
    try {
      const vulneraciones = await Vulneracion.findAll({
        order: [['vulneracion', 'ASC']]
      });
      res.json(vulneraciones);
    } catch (error) {
      console.error('Error al obtener vulneraciones:', error);
      res.status(500).json({
        message: 'Error al obtener las vulneraciones',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  

 