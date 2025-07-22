import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader != undefined && authHeader.startsWith('Bearer ')) {
  try {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
   
    next();
  } catch (err) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
  }else{
    res.status(401).json({ mensaje: 'acceso denegado' });
  }
};
