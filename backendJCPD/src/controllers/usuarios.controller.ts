import { Request, Response } from "express";
import { usuarios } from "../models/usuarios.models";
import { Canton } from "../models/cantones.models";
import bcrypt from "bcryptjs";
import { registrarUsuario } from "../services/user.service";

// Crear usuario
export const getRegistrarUsuario = async (req: Request, res: Response) => {
  try {
    const nuevoUsuario = await registrarUsuario(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario ya existe") {
      return res.status(400).json({ mensaje: error.message });
    }

    res.status(500).json({ mensaje: "Error al crear usuario", error });
  }
};


// Obtener usuarios
export const obtenerUsuarios = async (_req: Request, res: Response) => {
  try {
    const allusuarios = await usuarios.findAll({
      include: [{ model: Canton, as: "canton" }],
    });
    const usuariosMapeados = allusuarios.map(u => ({
  ...u.dataValues,
  canton: u.canton?.canton
}));

    res.json(usuariosMapeados );
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
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

    await usuarios.update(datos, { where: { id } });
    res.json({ mensaje: "Usuario actualizado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar usuario" });
  }
};

// Desactivar usuario
export const desactivarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await usuarios.update({ isactivo: false }, { where: { id } });
    res.json({ mensaje: "Usuario desactivado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al desactivar usuario", error });
  }
};

// Eliminar usuario definitivamente
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await usuarios.destroy({ where: { id } });
    res.json({ mensaje: "Usuario eliminado definitivamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario", error });
  }
};
