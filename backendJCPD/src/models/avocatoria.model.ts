import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Denuncia } from './denuncia.models';
import { MedidasEmergentes } from './medidas_emergentes.model';

interface AvocatoriaAttributes {
  id: number;
  
  horaCreado: string;
  codigoTramite: string;
  disposiciones: string;
  idDenuncia: number;
  articulo: string;
  estatus?: "pendiente"|"en_proceso"|"completada";
}

interface AvocatoriaCreationAttributes extends Optional<AvocatoriaAttributes, 'id'> {}

export class Avocatoria extends Model<AvocatoriaAttributes, AvocatoriaCreationAttributes> implements AvocatoriaAttributes {
  declare id: number;

declare  horaCreado: string;
declare  codigoTramite: string;
declare  disposiciones: string;
declare  idDenuncia: number;
declare  articulo: string;
declare  fechaCreado: Date;
declare  estatus: "pendiente"|"en_proceso"|"completada";
declare denunciaAvocatoria?: Denuncia;
declare medidasE?:MedidasEmergentes[];

}

Avocatoria.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  articulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  idDenuncia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
  estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Avocatoria',
  tableName: 'avocatoria',
  timestamps: true,
  createdAt: 'fechaCreado',
  updatedAt: false,
});

