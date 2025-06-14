// models/hecho.model.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface HechoAttributes {
  id: number;
  descripcion: string;
}

export type HechoCreationAttributes = Optional<HechoAttributes, 'id'>;

export class Hecho extends Model<HechoAttributes, HechoCreationAttributes> implements HechoAttributes {
  public id!: number;
  public descripcion!: string;
}

Hecho.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'Hecho',
  tableName: 'hechos',
  timestamps: false,
});
