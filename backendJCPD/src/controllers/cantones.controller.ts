import { Request, Response } from 'express';
import { Canton } from '../models';

export const obtenerCantones = async (_req: Request, res: Response) => {
  try {
    const cantones = await Canton.findAll();
    
    res.json(cantones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los cantones' });
  }
};
