import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/usuarios.models';
import dotenv from 'dotenv';

dotenv.config();

export const iniciarsesion = async (req: Request, res: Response) => {
  const { usuario, contrasena } = req.body;

  try {
    const user = await Usuario.findOne({ where: { usuario } });

    if (!user) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    const passwordValido = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordValido) {
      res.status(401).json({ mensaje: 'Contraseña incorrecta' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        rol: user.rol,
        canton: user.id_canton
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '4h' }
    );

    res.json({ token, usuario: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const obtenerPerfil = async(req: Request, res: Response) => {
  if (!req.usuario) {
    res.status(403).json({ mensaje: 'Token no válido o ausente' });
    return;
  }

  res.json({
    mensaje: 'Perfil del usuario',
    usuario: req.usuario
  });
};
