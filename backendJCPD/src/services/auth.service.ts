import bcrypt from "bcryptjs";
import { usuarios } from "../models";

import { login } from "../interfaces/auth.interface";
import { Canton } from "../models";

import { generarToken } from "../utils/jwt.handle";
import { jwtpayload } from "../interfaces/auth.interface";
import { RegistrarLoggs } from "./loggs.service";


//------------------------METODOS POST----------------//

export const loginUsuario = async (user: login) => {

  console.log("Iniciando proceso de autenticación para el usuario:", user.usuario);
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

  if (!existe.isactivo) {

    console.log("Usuario inactivo, contacte al administrador");
    return "Usuario inactivo, contacte al administrador";
  }
  RegistrarLoggs({
        idUsuario: existe.id,
      usuario:existe.usuario ,
      nombres: existe.nombres,
      fase:'registro usuario',
      accion:'LOGIN' ,
      descripcion:`El usuario ${existe.usuario} acaba de iniciar sesion` ,
      canton:existe.Canton?.canton
      
    });


  console.log("Usuario autenticado correctamente");

  console.log("Generando token JWT para el usuario:", existe);

  const sing: jwtpayload = { ///--->armamos el payload
    id: existe.id,
    nombres: existe.nombres,
    usuario: existe.usuario,
    rol: existe.rol,
    canton: existe.Canton?.canton || '',
    id_canton: existe.id_canton || 0,
    isactivo: existe.isactivo
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
    const resUSuario:any ={
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      rol: usuario.rol,
      id_canton:usuario.id_canton||"",
      canton:usuario.Canton?.canton||'',
      correo:usuario.correo,
      usuario:usuario.usuario
    }
    

    

    return resUSuario;
}

// Servicio para validar la contraseña de un usuario
export async function validarContrasenaUsuario(idUsuario: number, contrasenaActual: string) {
  try {
    // Buscar el usuario por ID
    const usuario = await usuarios.findByPk(idUsuario, {
      attributes: ['id', 'usuario', 'contrasena']
    });

    if (!usuario) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    // Comparar la contraseña proporcionada con la almacenada
    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);

    if (!contrasenaValida) {
      return {
        success: false,
        message: 'Contraseña incorrecta'
      };
    }

    return {
      success: true,
      message: 'Contraseña válida'
    };

  } catch (error) {
    throw error;
  }
}

// Servicio para actualizar la contraseña del usuario
export async function actualizarContrasenaUsuario(idUsuario: number, contrasenaActual: string, contrasenaNueva: string, canton:string,nombres:string) {
  try {
    // Buscar el usuario por ID
    const usuario = await usuarios.findByPk(idUsuario, {
      attributes: ['id', 'usuario', 'contrasena','nombres','apellidos']
    });

    if (!usuario) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    // Validar la contraseña actual
    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);

    if (!contrasenaValida) {
      return {
        success: false,
        message: 'La contraseña actual es incorrecta'
      };
    }

    // Validar que la nueva contraseña sea diferente a la actual
    const mismaContrasena = await bcrypt.compare(contrasenaNueva, usuario.contrasena);
    if (mismaContrasena) {
      return {
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual'
      };
    }

    // Hashear la nueva contraseña
    const hashedNuevaContrasena = await bcrypt.hash(contrasenaNueva, 10);

    // Actualizar la contraseña en la base de datos
    const [filasActualizadas] = await usuarios.update(
      { contrasena: hashedNuevaContrasena },
      { where: { id: idUsuario } }
    );

    if (filasActualizadas === 0) {
      return {
        success: false,
        message: 'No se pudo actualizar la contraseña'
      };
    }
    RegistrarLoggs({
        idUsuario: usuario.id,
      usuario:usuario.usuario ,
      nombres: nombres,
      fase:'registro usuarios',
      accion:'UPDATE' ,
      descripcion:`El usuario ${usuario.usuario} acaba de ACTUALIZAR SU CONTRASENA` ,
      canton:canton
      
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente'
    };

  } catch (error) {
    throw error;
  }
}






