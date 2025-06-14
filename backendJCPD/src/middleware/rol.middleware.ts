import { Request, Response, NextFunction } from 'express';

export const verificarRol = (rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rol = req.usuario?.rol;

    if (!rol || !rolesPermitidos.includes(rol)) {
      res.status(403).json({ mensaje: 'Acceso denegado: rol no autorizado' });
      return;
    }

    next();
  };
};
