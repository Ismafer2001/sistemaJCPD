// models/vulneracionIdentificada.model.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class VulneracionIdentificada extends Model {
  public hechoId!: number;
  public vulneracionId!: number;
}

VulneracionIdentificada.init({
  hechoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'hechos', key: 'id' },
  },
  vulneracionId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'vulneraciones', key: 'id' },
  },
}, {
  sequelize,
  modelName: 'VulneracionIdentificada',
  tableName: 'vulneraciones_identificadas',
  timestamps: false,
});
