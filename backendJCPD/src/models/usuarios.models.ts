import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

import { Canton } from './cantones.models';

interface usuarioAttributes {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  contrasena: string;
  rol: 'admin' | 'principal' | 'secretari@' | 'suplente';
  isactivo: boolean;
  id_canton: number;
  
}
interface UsuarioCreationAttributes extends Optional<usuarioAttributes, 'id' | 'isactivo' >{
  
}

export class usuarios extends Model<usuarioAttributes, UsuarioCreationAttributes>
  implements usuarioAttributes {
declare  id: number;
declare  usuario: string;
declare  nombres: string;
declare  apellidos: string;
declare  correo: string;
declare  contrasena: string;
  declare rol: 'admin' | 'principal' | 'secretari@' | 'suplente';
declare  isactivo: boolean;
declare  id_canton: number;

  declare Canton?: Canton;
  
}

usuarios.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario: { type: DataTypes.STRING, allowNull: false, unique: true },
  nombres: { type: DataTypes.STRING, allowNull: false },
  apellidos: { type: DataTypes.STRING, allowNull: false },
  correo: { type: DataTypes.STRING,unique: true },
  contrasena: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'principal', 'secretari@', 'suplente'), allowNull: false },
  isactivo: { type: DataTypes.BOOLEAN, defaultValue: true },
  id_canton: { type: DataTypes.INTEGER, allowNull: false, references: { model: Canton, key: 'id' } },
  
}, {
  sequelize,
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'fechaCreado',
  updatedAt: false,
});


