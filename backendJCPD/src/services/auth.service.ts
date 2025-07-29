import bcrypt from "bcryptjs";
import{ usuarios} from "../models";
import jwt from 'jsonwebtoken';
import { login } from "../interfaces/auth.interface";
import { Canton } from "../models";
import { handlehttp } from "../utils/error.handle";
import { generarToken } from "../utils/jwt.handle";
import { jwtpayload } from "../interfaces/usuarios.interface";




export const loginUsuario = async (user: login) => {
  
    const existe = await usuarios.findOne({ where: { usuario: user.usuario },
        include: [{ model: Canton ,  attributes: ['canton'] }]  });

        
    
        if (!existe) {
          
          return "Usuario no encontrado"
          
        }
    
        const passwordValido = await bcrypt.compare(user.contrasena, existe.contrasena);
        if (!passwordValido) {
           return "contraseña incorrecta"
          
        }
        

       
        const sing:jwtpayload = 
              {
                id: existe.id,
                nombres: existe.nombres,
                usuario: existe.usuario,
                rol: existe.rol,
                canton:existe.Canton?.canton,
                id_canton:existe.id_canton
                
              }
              

        const token = generarToken(sing)
        
            

            return token

}