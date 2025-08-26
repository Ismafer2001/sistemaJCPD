import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


interface NotificacionAttributes {
  id: number;
  codigoTramite: string;
  fechaAvocatoria: Date;
  diriguidoA: string;
  parte: string;
  direccion: string;
  datosGenerales?: string;
  idDenuncia: number;
  estatus?: "pendiente"|"en_proceso"|"completada";
}

interface NotificacionCreationAttributes extends Optional<NotificacionAttributes, 'id'> {}

export class Notificacion extends Model<NotificacionAttributes, NotificacionCreationAttributes> implements NotificacionAttributes {
  declare id: number;
  declare codigoTramite: string;
  declare fechaAvocatoria: Date;
  declare parte: string;
  declare direccion: string;
  declare datosGenerales: string;
  declare idDenuncia: number;
  declare diriguidoA: string;
  declare estatus: "pendiente"|"en_proceso"|"completada";
}

Notificacion.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codigoTramite: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaAvocatoria: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  parte: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  datosGenerales: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
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
  
  diriguidoA: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Notificacion',
  tableName: 'notificacion',
  timestamps: true,
  createdAt: 'fechaCreado',
  updatedAt: false,
});


