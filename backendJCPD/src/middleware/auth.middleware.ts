import { Request, Response, NextFunction } from "express";
import { checkToken } from "../utils/jwt.handle";
import { usuarios } from "../models";

export const verificarToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ").pop();
    

    // Extrae el ID del usuario del token decodificado.
    const decoded = await checkToken(`${token}`);
    if (!decoded) {
      res.status(401).json({ mensaje: "No tienes un JWT válido" });
      return;
    }

    // Verificar si el usuario existe y está activo en la base de datos
    const usuario = await usuarios.findOne({ 
      where: { 
        id: decoded.id,
        isactivo: true // Verificar que esté activo
      } 
    });

    if (!usuario) {
      res.status(401).json({ 
        message: "Usuario inactivo o no encontrado",
        code: "USER_INACTIVE" 
      });
      return;
    }

    // Agregar información completa del usuario a la request
    req.user = {
      ...decoded,
      isactivo: usuario.isactivo,
      // Otros campos que necesites...
    };

    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ mensaje: "Acceso denegado" });
  }
};
