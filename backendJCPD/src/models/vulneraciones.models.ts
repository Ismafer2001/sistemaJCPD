// models/vulneracion.model.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VulneracionAttributes {
  id: number;
  vulneracion: string;
  cuerpoLegal: string; // 
}

interface VulneracionCreationAttributes extends Optional<VulneracionAttributes, 'id'>{
  
}

export class Vulneracion extends Model<VulneracionAttributes, VulneracionCreationAttributes> implements VulneracionAttributes {
  declare id: number;
  declare vulneracion: string;
  declare cuerpoLegal: string;
}

Vulneracion.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vulneracion: { type: DataTypes.STRING, allowNull: false },
  cuerpoLegal: { type: DataTypes.STRING, allowNull: false },
},
 {
  sequelize,
  modelName: 'Vulneracion',
  tableName: 'vulneraciones',
  timestamps: false,
});
