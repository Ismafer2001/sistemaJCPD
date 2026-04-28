
import { RegistrarUsuarioDTOS, usuarioUpdate } from "../interfaces/usuarios.interface";
import { Canton } from "../models";
import { usuarios } from "../models/usuarios.models";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { RegistrarLoggs } from "./loggs.service";

//------------------------METODOS GET---------------//

//obtener todos los usuarios
export const obtenerUsuarios = async () => {

  const allusuarios = await usuarios.findAll({
      where: {
        rol: { [Op.ne]: 'admin' } // Excluir usuarios con rol admin
      },
      include: [{ model: Canton}],
    });
    const usuariosMapeados = allusuarios.map(u => ({
  ...u.dataValues,
  canton: u.Canton.canton
}));

return usuariosMapeados;
}
 
// Obtener usuarios activos con rol 'principal' para un cantón específico
export const ActivosPorCantonPrincipal = async (id_canton: number, { limit, offset }: { limit?: number; offset?: number } = {}) => {
  const where: any = { isactivo: true, rol: 'principal', id_canton };

  const users = await usuarios.findAll({ where, limit, offset, attributes: [ 'nombres', 'apellidos'] });
  return users;
};

//-----------------------METODOS POST-----------//

//ingresar usuario
export const registrarUsuario = async (user: RegistrarUsuarioDTOS,idUsuario:number,usuario:string,nombres:string,canton:string) => {
  try {
    const existe = await usuarios.findOne({ where: { usuario: user.usuario} });
    if (existe) {
    const error = new Error("Usuario ya existe");
    error.name = "Usuarioyaexiste";
    throw error;
    }
    const hashed = await bcrypt.hash(user.contrasena, 10);
    const nuevoUsuario =usuarios.create({ ...user, contrasena: hashed });


    RegistrarLoggs({
            idUsuario: idUsuario,
          usuario:usuario ,
          nombres: nombres,
          fase:'Gestionar usuarios',
          accion:'CREATE' ,
          descripcion:` ${usuario} acaba de agregar al usuario ${user.usuario}` ,
          canton:canton
          
        });
        return nuevoUsuario
    
  } catch (error) {
    throw error;
    
  }
  
    
    
    
  
  
  
};

export const actualizarUsuario= async (data:usuarioUpdate,id:string,idUsuario:number,usuario:string,nombres:string,canton:string)=>{
  try {
    
    if (data.contrasena) {
      data.contrasena = await bcrypt.hash(data.contrasena, 10);
    }
    const usuarioactualizado = await usuarios.update(data, { where: { id:id } });
     RegistrarLoggs({
            idUsuario: idUsuario,
          usuario:usuario ,
          nombres: nombres,
          fase:'gestionar usuarios',
          accion:'UPDATE' ,
          descripcion:` ${usuario} acaba de actualizar un usuario con numero de id ${id}` ,
          canton:canton
          
        });
    return usuarioactualizado
    
  } catch (error) {
    throw(error);
  }
}

//-----------------------METODOS PUT-----------//
export const cambiarEstadoUsuario = async (id: number, isactivo: boolean,idUsuario:number,usuario:string,nombres:string,canton:string) => {
  const actualizarestado = await usuarios.update({ isactivo }, { where: { id } });
   RegistrarLoggs({
            idUsuario: idUsuario,
          usuario:usuario ,
          nombres: nombres,
          fase:'gestionar usuarios',
          accion:'UPDATE' ,
          descripcion:` ${usuario} acaba de actualizar el usuario ${id}  con numero de id ${id} a un estado activo ${isactivo}` ,
          canton:canton
          
        });
  return actualizarestado;
}

//-----------------------METODOS DELETE-----------//
export const eliminarUsuario = async(id:number,idUsuario:number,usuario:string,nombres:string,canton:string)=>{
  const eliminarUsuario = await usuarios.destroy({ where: { id } });
  RegistrarLoggs({
            idUsuario: idUsuario,
          usuario:usuario ,
          nombres: nombres,
          fase:'gestionar usuarios',
          accion:'UPDATE' ,
          descripcion:` ${usuario} acaba de eliminar al usuario ${id}  ` ,
          canton:canton
          
        });
  return eliminarUsuario;


}
