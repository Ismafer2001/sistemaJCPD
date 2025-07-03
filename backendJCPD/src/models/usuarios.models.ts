import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface UsuarioAttributes {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  contrasena: string;
  rol: 'admin' | 'principal' | 'secretari@' | 'suplente';
  isactivo: boolean;
  id_canton: number;
  fecha_creacion?: Date;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'isactivo' | 'fecha_creacion'>{
  
}

export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes {
  public id!: number;
  public usuario!: string;
  public nombres!: string;
  public apellidos!: string;
  public correo!: string;
  public contrasena!: string;
  public rol!: 'admin' | 'principal' | 'secretari@' | 'suplente';
  public isactivo!: boolean;
  public id_canton!: number;
  public fecha_creacion!: Date;
}

Usuario.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario: { type: DataTypes.STRING, allowNull: false, unique: true },
  nombres: { type: DataTypes.STRING, allowNull: false },
  apellidos: { type: DataTypes.STRING, allowNull: false },
  correo: { type: DataTypes.STRING },
  contrasena: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM('admin', 'principal', 'secretari@', 'suplente'), allowNull: false },
  isactivo: { type: DataTypes.BOOLEAN, defaultValue: true },
  id_canton: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'canton', key: 'id' } },
  fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  tableName: 'usuarios',
  modelName: 'Usuario',
  timestamps: false,
});


