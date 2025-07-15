import bcrypt from "bcryptjs";
import{ usuarios} from "../models/usuarios.models";
import jwt from 'jsonwebtoken';
import { login } from "../interfaces/auth.interface";

export const loginUsuario = async (user: login) => {
  
    const existe = await usuarios.findOne({ where: { usuario: user.usuario } });
    
    
    
        if (!existe) {
          throw new Error("Usuario no encontrado");
          
        }
    
        const passwordValido = await bcrypt.compare(user.contrasena, existe.contrasena);
        if (!passwordValido) {
          throw new Error("contraseña incorrecta");
        }
        const token = jwt.sign(
              {
                id: existe.id,
                nombres: existe.nombres,
                usuario: existe.usuario,
                rol: existe.rol,
                canton: existe.id_canton
              },
              process.env.JWT_SECRET || 'secret',
              { expiresIn: '4h' }
            );

            return token

}