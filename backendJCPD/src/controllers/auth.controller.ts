import { Request, Response } from 'express';
import { loginUsuario, UsuarioActual, validarContrasenaUsuario, actualizarContrasenaUsuario } from '../services/auth.service';

import { handlehttp } from '../utils/error.handle';

//-----------CONTROLADORES GET -------------------//
// Obtener usuario actual
export const getObtenerUsuarioActual = async (req: Request, res: Response) => {
  try {
     // Extrae el ID del usuario del token decodificado.
            const id: number = Number(req.user.id);

    // Si no se obtiene un ID válido, devuelve un error de autorización.
    if (!id) return res.status(401).json("Unauthorized");

    const usuario = await UsuarioActual(id);
    

    res.json(usuario);
  } catch (error:any) {
     if (error.name === "UsuarioNoAutorizado") {
    return res.status(401).json({ error: error.message });
  }
    handlehttp(res,"Error_get_ obtenerelusuario",error)


  }
};

//-----------CONTROLADORES POST -------------------//

// Login de usuario
export const postloginUsuario = async (req: Request, res: Response) => {
  try {
    const token = await loginUsuario(req.body);
     if(token=="Usuario no encontrado"){
      res.status(401).json(token)
      
    }

    if(token=="contraseña incorrecta"){
      res.status(401).json(token)
      
    }
    if(token=="Usuario inactivo, contacte al administrador"){
      res.status(403).json({message:token})
    }
    
    
    res.status(200).json({token})
    
  } catch (error) {
    handlehttp(res,"Error_post_login",error)
    
  }
};

// Validar contraseña de usuario
export const postValidarContrasena = async (req: Request, res: Response) => {
  try {
    const { contrasenaActual } = req.body;
    
    // Obtener ID del usuario desde el token JWT
    const idUsuario: number = Number(req.user.id);

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autorizado'
      });
    }

    if (!contrasenaActual) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es requerida'
      });
    }

    const resultado = await validarContrasenaUsuario(idUsuario, contrasenaActual);
    
    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(400).json(resultado);
    }

  } catch (error) {
    handlehttp(res, 'Error al validar contraseña', error);
  }
};

// Actualizar contraseña de usuario
export const putActualizarContrasena = async (req: Request, res: Response) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;
    
    // Obtener ID del usuario desde el token JWT
    const idUsuario: number = Number(req.user.id);
    const canton:string = String(req.user.canton)
    const nombres = req.user.nombres

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autorizado'
      });
    }

    // Validar campos requeridos
    if (!contrasenaActual) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es requerida'
      });
    }

    if (!contrasenaNueva) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña es requerida'
      });
    }

    // Validar longitud mínima de la nueva contraseña
    if (contrasenaNueva.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const resultado = await actualizarContrasenaUsuario(idUsuario, contrasenaActual, contrasenaNueva,canton,nombres);
    
    if (resultado.success) {
      res.status(200).json(resultado);
    } else {
      res.status(400).json(resultado);
    }

  } catch (error) {
    handlehttp(res, 'Error al actualizar contraseña', error);
  }
};

    

 



