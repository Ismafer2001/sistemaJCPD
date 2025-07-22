import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const soloAdmin = (req: Request, res: Response, next: NextFunction) => {

  /*if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
  }*/
 const token:string = req.headers.authorization?.split(' ')[1] as string;
     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
     if (!decoded || (decoded as any).rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
     };
  next(); // Es admin, puede pasar
};
