import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const soloAdmin = (req: Request, res: Response, next: NextFunction) => {

  /*if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
  }*/
 
     if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
     };
  next(); // Es admin, puede pasar
};
