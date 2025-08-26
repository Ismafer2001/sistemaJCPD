import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { medida } from './medidas_proteccion.models';
import { Avocatoria } from './avocatoria.model';
import { Afectado } from './afectado.models';


interface MedidasEmergentesAttributes {
  id: number;
  idMedida: number;
  idAvocatoria: number;
  idAfectado: number;
  observaciones: string;
  periodo: string;
}

interface MedidasEmergentesCreationAttributes extends Optional<MedidasEmergentesAttributes, 'id'> {}

export class MedidasEmergentes extends Model<MedidasEmergentesAttributes, MedidasEmergentesCreationAttributes> implements MedidasEmergentesAttributes {
  declare id: number;
  declare idMedida: number;
  declare idAvocatoria: number;
  declare idAfectado: number;
  declare observaciones: string;
  declare periodo: string;
}

MedidasEmergentes.init({
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
  idAvocatoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Avocatoria,
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
  modelName: 'MedidasEmergentes',
  tableName: 'medidas_emergentes',
  timestamps: false,
});


