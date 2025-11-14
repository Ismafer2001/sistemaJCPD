import { Request, Response } from "express";
import { usuarios } from "../models/usuarios.models";

import bcrypt from "bcryptjs";
import { registrarUsuario, ActivosPorCantonPrincipal, obtenerUsuarios, cambiarEstadoUsuario, eliminarUsuario } from "../services/user.service";
import { handlehttp } from "../utils/error.handle";
//--------------------CONTROLADORES GET-----------------//

// Obtener usuarios
export const getObtenerUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await obtenerUsuarios()
    
    res.json(usuarios);
  } catch (error) {
    handlehttp(res, 'error_get_activos_principal', error);

  }
};
// Obtener usuarios activos con rol 'principal' para un cantón específico
export const obtenerActivosPorCantonPrincipal = async (req: Request, res: Response) => {
  try {
    
    const id_canton = Number((req.user as any).id_canton);
    if (!id_canton || Number.isNaN(id_canton)) {
      return res.status(400).json({ mensaje: 'id_canton inválido o ausente' });
    }

    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const users = await ActivosPorCantonPrincipal(id_canton, { limit, offset });
    res.json(users);
  } catch (error) {
    handlehttp(res, 'error_get_activos_principal', error);
  }
};

//--------------CONTROLADORES POST-----------------//
// Crear usuario
export const postRegistrarUsuario = async (req: Request, res: Response) => {
  try {
    const nuevoUsuario = await registrarUsuario(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error:any) {
    if ( error.name === "Usuarioyaexiste") {
      return res.status(400).json({ message: error.message });
    }

    handlehttp(res,"error_post_registar usuario", error);
  }
};

//-------------------CONTROLADORES PUT-------------//

// Actualizar usuario
export const putUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    if (datos.contrasena) {
      datos.contrasena = await bcrypt.hash(datos.contrasena, 10);
    }

    await usuarios.update(datos, { where: { id } });
    res.json({ mensaje: "Usuario actualizado" });
  } catch (error) {
    handlehttp(res,"error_put_Actualizar_Usuario", error);
    res.status(500).json({ mensaje: "Error al actualizar usuario" });
  }
};

// cambiar estado usuario (activar/desactivar)
export const putEstadoUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isactivo } = req.body; // true o false

    if (typeof isactivo !== "boolean") {
      return res.status(400).json({ mensaje: "El campo 'isactivo' debe ser booleano" });
    }

    await cambiarEstadoUsuario(Number(id), isactivo);
    res.json({ mensaje: `Usuario ${isactivo ? "activado" : "desactivado"} correctamente` });
  } catch (error) {
    handlehttp(res, "error_put_estado_usuario", error);
  }
};

//--------------------METODOS DELETE------------//

// Eliminar usuario definitivamente
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await eliminarUsuario(Number(id));
    
    res.json({ mensaje: "Usuario eliminado definitivamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario", error });
  }
};



