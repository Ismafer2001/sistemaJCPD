import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginUsuario } from '../services/auth.service';
import { Canton, usuarios } from '../models';
import { login } from '../interfaces/auth.interface';



export const postloginUsuario = async (req: Request, res: Response) => {
  try {
    const responlogin = await loginUsuario(req.body);
    
    res.status(200).json(responlogin)
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
    
  }
};
// Obtener usuario actual
export const getObtenerUsuarioActual = async (req: Request, res: Response) => {
  try {
    const token:string = req.headers.authorization?.split(' ')[1] as string;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
     // Extrae el ID del usuario del token decodificado.
            const id: number = Number((decoded as any).id);

            // Si no se obtiene un ID válido, devuelve un error de autorización.
            if (!id) return res.status(401).json("Unauthorized");
    
    const usuario = await usuarios.findByPk(id, {
      include: [
        {
          model: Canton,
          as: "canton",
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
      canton:usuario?.canton?.canton

    }
    

    if (!usuario) {
      return res.status(401).json({ mensaje: "Unauthorized" });
    }
    res.json(resUSuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el usuario"  });
    console.log(error)
    
  }
};


