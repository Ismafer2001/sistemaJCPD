import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Denuncia } from './denuncia.models';
import { Vulneracion } from './vulneraciones.models';

interface VulneracionesIdentificadasAttributes {
  id: number;
  denuncia_id: number;
  vulneracion_id: number;
}

export type VulneracionesIdentificadasCreationAttributes = Optional<VulneracionesIdentificadasAttributes, 'id'>;

export class VulneracionesIdentificadas extends Model<VulneracionesIdentificadasAttributes, VulneracionesIdentificadasCreationAttributes> implements VulneracionesIdentificadasAttributes {
  public id!: number;
  public denuncia_id!: number;
  public vulneracion_id!: number;
}

VulneracionesIdentificadas.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  denuncia_id: { 
    type: DataTypes.INTEGER,
    references: {
      model: Denuncia,
      key: 'id'
    }
  },
  vulneracion_id: { 
    type: DataTypes.INTEGER,
    references: {
      model: Vulneracion,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'VulneracionesIdentificadas',
  tableName: 'vulneracionesidentificadas',
  timestamps: false
}); 