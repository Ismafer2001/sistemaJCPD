import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { usuarioAttributes } from '../interfaces/usuarios.interface';



interface UsuarioCreationAttributes extends Optional<usuarioAttributes, 'id' | 'isactivo' | 'fecha_creacion'>{
  
}

export class usuarios extends Model<usuarioAttributes, UsuarioCreationAttributes>
  implements usuarioAttributes {
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

usuarios.init({
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
  timestamps: false,
});


