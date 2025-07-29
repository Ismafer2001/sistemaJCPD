import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

import { Vulneracion } from './vulneraciones.models';
import { Afectado } from './afectado.models';

interface VulneracionesIdentificadasAttributes {
  id: number;
  idAfectado: number;
  idVulneracion: number;
}

interface VulneracionesIdentificadasCreationAttributes extends Optional<VulneracionesIdentificadasAttributes, 'id'>{
  
}

export class VulneracionesIdentificadas extends Model<VulneracionesIdentificadasAttributes, VulneracionesIdentificadasCreationAttributes> implements VulneracionesIdentificadasAttributes {
  declare id: number;
  declare idAfectado: number;
  declare idVulneracion: number;
}

VulneracionesIdentificadas.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idAfectado: { 
    type: DataTypes.INTEGER,
    
  },
  idVulneracion: { 
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