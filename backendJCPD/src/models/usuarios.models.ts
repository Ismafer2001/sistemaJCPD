import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Canton } from './cantones.models';

export class Usuario extends Model {
  public id!: Number;
  public nombres!: string;
  public apellidos!: string;
  public user!: string;
  public correo!: string;
  public contrasena!: string;
  public rol!: 'admin' | 'principal' | 'secretari@' | 'suplente';
  public estado!: boolean;
  public canton_id!: string;
  public fecha_creacion!: Date;
}

Usuario.init({
  id: {
    
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey: true,
  },
  nombres: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'principal', 'secretari@', 'suplente'),
    allowNull: false,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  canton_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuarios',
  timestamps: false,
});

Usuario.belongsTo(Canton, { foreignKey: 'canton_id', as: 'canton' });