import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


interface NotificacionAttributes {
  id: number;
  codigoTramite: string;
  fecha: Date;
  diriguidoA: string;
  parte: string;
  direccion: string;
  datosGenerales: string;
  idDenuncia: number;
}

interface NotificacionCreationAttributes extends Optional<NotificacionAttributes, 'id'> {}

export class Notificacion extends Model<NotificacionAttributes, NotificacionCreationAttributes> implements NotificacionAttributes {
  declare id: number;
  declare codigoTramite: string;
  declare fecha: Date;
  declare parte: string;
  declare direccion: string;
  declare datosGenerales: string;
  declare idDenuncia: number;
  declare diriguidoA: string;
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
  fecha: {
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
  timestamps: false,
});


