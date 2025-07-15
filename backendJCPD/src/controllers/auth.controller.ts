import { Request, Response } from 'express';



import { loginUsuario } from '../services/auth.service';
import { Canton, usuarios } from '../models';



export const iniciarsesion = async (req: Request, res: Response) => {
  
  
  try {
    const responlogin = await loginUsuario(req.body);
    
    res.status(200).json(responlogin)
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
// Obtener usuario actual
export const obtenerUsuarioActual = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarios.findByPk(req.user.id, {
      include: [
        {
          model: Canton,
          as: "canton",
          attributes: ["canton"], // solo queremos el nombre
        },
      ],
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el usuario" });
  }
};


