import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

import { Canton } from './cantones.models';

interface loggsAttributes {
  id: number;
  idUsuario: number
  usuario: string;
  nombres: string;
  fase: string;
  accion: string;
  descripcion: string;
  canton: string
  
  
}
interface loggsCreationAttributes extends Optional<loggsAttributes, 'id'  >{
  
}

export class Loggs extends Model<loggsAttributes, loggsCreationAttributes>
  implements loggsAttributes {
declare  id: number;
declare idUsuario: number
declare  usuario: string;
declare  nombres: string;
declare fase:string;
declare accion: string;
declare descripcion: string;
declare canton: string;

  declare Canton: Canton;
  
}

Loggs.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idUsuario: { type: DataTypes.INTEGER, allowNull: false },
  usuario: { type: DataTypes.STRING, allowNull: false },
  nombres: { type: DataTypes.STRING, allowNull: false },
  fase: { type: DataTypes.STRING, allowNull: false },
  
  accion: { type: DataTypes.STRING },
  descripcion: { type: DataTypes.STRING, allowNull: false },
  canton: { type: DataTypes.STRING, allowNull: true, },
  
}, {
  sequelize,
  tableName: 'loggs',
  timestamps: true,
  createdAt: 'fechaCreado',
  updatedAt: false,
});


