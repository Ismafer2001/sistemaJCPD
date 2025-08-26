import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginUsuario } from '../services/auth.service';
import { Canton, usuarios } from '../models';

import { handlehttp } from '../utils/error.handle';



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
// Obtener usuario actual
export const getObtenerUsuarioActual = async (req: Request, res: Response) => {
  try {
    
    
    

     // Extrae el ID del usuario del token decodificado.
            const id: number = Number(req.user.id);

            // Si no se obtiene un ID válido, devuelve un error de autorización.
            if (!id) return res.status(401).json("Unauthorized");
    
    const usuario = await usuarios.findByPk(id, {
      include: [
        {
          model: Canton,
          
          attributes: ["canton"], // solo queremos el nombre
        },
      ],
    });
    const resUSuario ={
      id: usuario?.id,
      nombres: usuario?.nombres,
      apellidos: usuario?.usuario,
      rol: usuario?.rol,
      id_canton:usuario?.id_canton,
      canton:usuario?.Canton?.canton

    }
    

    if (!usuario) {
      return res.status(401).json({ mensaje: "Unauthorized" });
    }
    res.json(resUSuario);
  } catch (error) {
    handlehttp(res,"Error_get_ obtenerelusuario",error)
    
    
  }
};


