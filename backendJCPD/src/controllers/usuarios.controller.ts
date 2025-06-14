import { Request, Response } from 'express';
import { Usuario } from '../models/usuarios.models';
import { Canton } from '../models/cantones.models';
import bcrypt from 'bcryptjs';


// Crear usuario
export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const { usuario, contrasena, ...resto } = req.body;

    const existe = await Usuario.findOne({ where: { usuario } });
    if (existe) { res.status(400).json({ mensaje: 'Usuario ya existe' });
    return;

  }

    const hashed = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuario.create({ usuario, contrasena: hashed, ...resto });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error });
  }
};

// Obtener usuarios
export const obtenerUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      
      include: [{ model: Canton, as: 'canton' }]
    });

    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    if (datos.contrasena) {
      datos.contrasena = await bcrypt.hash(datos.contrasena, 10);
    }

    await Usuario.update(datos, { where: { id } });
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

// Desactivar usuario
export const desactivarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Usuario.update({ isactivo: false }, { where: { id } });
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desactivar usuario', error });
  }
};

// Eliminar usuario definitivamente
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Usuario.destroy({ where: { id } });
    res.json({ mensaje: 'Usuario eliminado definitivamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error });
  }
};
