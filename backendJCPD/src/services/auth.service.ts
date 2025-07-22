import bcrypt from "bcryptjs";
import{ usuarios} from "../models";
import jwt from 'jsonwebtoken';
import { login } from "../interfaces/auth.interface";
import { Canton } from "../models";




export const loginUsuario = async (user: login) => {
  
    const existe = await usuarios.findOne({ where: { usuario: user.usuario },
        include: [{ model: Canton, as:'canton' ,  attributes: ['canton'] }]  });

        
    
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
                canton:existe.canton?.canton
                
              },
              process.env.JWT_SECRET || 'secret',
              { expiresIn: '4h' }
            );
            

            return token

}