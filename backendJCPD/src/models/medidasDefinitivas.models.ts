import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { medida } from './medidas_proteccion.models';
import { Afectado } from './afectado.models';

import { AudienciaPruebas } from './audiencia_prueba.model';

interface MedidasDefinitivasAttributes {
  id: number;
  idMedida: number;
  
  idAfectado: number;
  observaciones: string;
  periodo: string;
}
interface MedidasDefinitivasCreationAttributes extends Optional<MedidasDefinitivasAttributes, 'id'> {}

export class MedidasDefinitivas extends Model<MedidasDefinitivasAttributes, MedidasDefinitivasCreationAttributes> implements MedidasDefinitivasAttributes {
  declare id: number;
  declare idMedida: number;
  
  declare idAfectado: number;
  declare observaciones: string;
  declare periodo: string;
  declare MedidasD?: medida;
}
MedidasDefinitivas.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  idMedida: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: medida,
      key: 'id',
    },
  },
   
  idAfectado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Afectado,
      key: 'id',
    },
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  periodo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'MedidasDefinitivas',
  tableName: 'medidas_definitivas',
  timestamps: false,
});