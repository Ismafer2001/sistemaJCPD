import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];

  if (authHeader != undefined && authHeader.startsWith('Bearer ')) {
  try {
    const token = authHeader.split(' ')[1];

    const decode =jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decode; // Asignar el usuario decodificado al objeto de solicitud
   
    next();
  } catch (err) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
  }else{
    res.status(401).json({ mensaje: 'acceso denegado' });
  }
};
