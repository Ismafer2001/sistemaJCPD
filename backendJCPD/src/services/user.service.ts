
import { RegistrarUsuarioDTOS } from "../interfaces/usuarios.interface";
import { Canton } from "../models";
import { usuarios } from "../models/usuarios.models";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

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
export const registrarUsuario = async (user: RegistrarUsuarioDTOS) => {
  
    
    const existe = await usuarios.findOne({ where: { usuario: user.usuario} });
    if (existe) {
    const error = new Error("Usuario ya existe");
    error.name = "Usuarioyaexiste";
    throw error;
    }
    const hashed = await bcrypt.hash(user.contrasena, 10);
  return usuarios.create({ ...user, contrasena: hashed });
  
  
};

//-----------------------METODOS PUT-----------//
export const cambiarEstadoUsuario = async (id: number, isactivo: boolean) => {
  const actualizarestado = await usuarios.update({ isactivo }, { where: { id } });
  return actualizarestado;
}

//-----------------------METODOS DELETE-----------//
export const eliminarUsuario = async(id:number)=>{
  const eliminarUsuario = await usuarios.destroy({ where: { id } });
  return eliminarUsuario;


}
