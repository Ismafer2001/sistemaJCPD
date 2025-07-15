import { Request, Response, NextFunction } from 'express';

export const soloAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
  }

  next(); // Es admin, puede pasar
};
