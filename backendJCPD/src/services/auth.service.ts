import bcrypt from "bcryptjs";
import { usuarios } from "../models";

import { login } from "../interfaces/auth.interface";
import { Canton } from "../models";

import { generarToken } from "../utils/jwt.handle";
import { jwtpayload } from "../interfaces/auth.interface";
import { JwtPayload } from "jsonwebtoken";

//------------------------METODOS POST----------------//

export const loginUsuario = async (user: login) => {
  const existe = await usuarios.findOne({ //-->verificamos que exista el usuario
    where: { usuario: user.usuario },
    include: [{ model: Canton, attributes: ["canton"] }],
  });

  if (!existe) {
    return "Usuario no encontrado";
  }

  const passwordValido = await bcrypt.compare(
    user.contrasena,
    existe.contrasena
  );
  if (!passwordValido) {
    return "contraseña incorrecta";
  }

  const sing: jwtpayload = { ///--->armamos el payload
    id: existe.id,
    nombres: existe.nombres,
    usuario: existe.usuario,
    rol: existe.rol,
    canton: existe.Canton.canton,
    id_canton: existe.id_canton,
  };

  const token = generarToken(sing); //generamos el token

  return token;
};

//------------------------METODOS GET------------------------//

export async function UsuarioActual(id:number) {
      const usuario = await usuarios.findByPk(id, {
      include: [
        {
          model: Canton,
          
          attributes: ["canton"], // solo queremos el nombre
        },
      ],
    });
    if (!usuario) {
      const error = new Error("usuario no autorizado");
    error.name = "Usuarionoautorizado";
      throw error
    }
    const resUSuario:JwtPayload ={
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.usuario,
      rol: usuario.rol,
      id_canton:usuario.id_canton,
      canton:usuario.Canton.canton

    }
    

    

    return resUSuario;
}
