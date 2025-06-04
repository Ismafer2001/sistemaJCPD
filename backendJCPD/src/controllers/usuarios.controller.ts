import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { Usuario } from '../models/usuarios.models';
import { Canton } from '../models/cantones.models';
import bcrypt from 'bcryptjs';


export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Canton, as: 'canton', attributes: ['nombre'] }]
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};
export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(usuario);
};

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const { nombres, apellidos,user, correo, contrasena, rol, estado, canton_id } = req.body;

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuario.create({
      nombres,
      apellidos,
      correo,
      contrasena: hashedPassword,
      user,
      rol,
      estado,
      canton_id,
      fecha_creacion: new Date()
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

export const editarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos,user, correo, rol, estado, canton_id } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.update({ nombres, apellidos,user, correo, rol, estado, canton_id });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

export const cambiarEstado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    usuario.estado = estado;
    await usuario.save();
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
  }
};

export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
