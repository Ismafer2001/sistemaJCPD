
import { RegistrarUsuarioDTOS } from "../interfaces/usuarios.interface";
import { usuarios,  } from "../models/usuarios.models";

import bcrypt from "bcryptjs";

//ingresar usuario
export const registrarUsuario = async (user: RegistrarUsuarioDTOS) => {
  
    
    const existe = await usuarios.findOne({ where: { usuario: user.usuario} });
    if (existe) {
      throw new Error("Usuario ya existe");
    }
    const hashed = await bcrypt.hash(user.contrasena, 10);
  return usuarios.create({ ...user, contrasena: hashed });
  
  
};
