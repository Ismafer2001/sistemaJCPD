// models/vulneracion.model.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VulneracionAttributes {
  id: number;
  vulneracion: string;
}

export type VulneracionCreationAttributes = Optional<VulneracionAttributes, 'id'>;

export class Vulneracion extends Model<VulneracionAttributes, VulneracionCreationAttributes> implements VulneracionAttributes {
  public id!: number;
  public vulneracion!: string;
}

Vulneracion.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vulneracion: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'Vulneracion',
  tableName: 'vulneraciones',
  timestamps: false,
});
