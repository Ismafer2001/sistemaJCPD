import { Request, Response } from 'express';
import { loginUsuario, UsuarioActual } from '../services/auth.service';
import { Canton, usuarios } from '../models';
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
    
    
    res.status(200).json({token})
    
  } catch (error) {
    handlehttp(res,"Error_post_login",error)
    
  }
};

    

 



