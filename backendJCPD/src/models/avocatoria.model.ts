import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Denuncia } from './denuncia.models';

interface AvocatoriaAttributes {
  id: number;
  fechaCreado: Date;
  horaCreado: string;
  codigoTramite: string;
  disposiciones: string;
  idDenuncia: number;
}

interface AvocatoriaCreationAttributes extends Optional<AvocatoriaAttributes, 'id'> {}

export class Avocatoria extends Model<AvocatoriaAttributes, AvocatoriaCreationAttributes> implements AvocatoriaAttributes {
  public id!: number;
  public fechaCreado!: Date;
  public horaCreado!: string;
  public codigoTramite!: string;
  public disposiciones!: string;
  public idDenuncia!: number;
}

Avocatoria.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fechaCreado: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  horaCreado: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  codigoTramite: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  disposiciones: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  idDenuncia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'denuncia',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Avocatoria',
  tableName: 'avocatoria',
  timestamps: false,
});

