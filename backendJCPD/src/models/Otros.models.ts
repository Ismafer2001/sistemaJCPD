import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


export interface OtrosAttributes {
  id: number;
  nombres: string;
   apellidos?: string;
  parte?: string;
  cedula?: string;
  tipoParticipante?: string;
  cargo?: string;
  institucion?: string;
  fase: string;
  idDenuncia: number;
  nombre_proyecto?: string;
  estado_notificar?:"Por notificar"|"Notificado"
  id_notificacion?: number
  estado_citar?:"Por citar"|"Citado"
  id_citacion?: number

  
}

interface OtrosCreationAttributes extends Optional<OtrosAttributes, 'id'> {}

export class Otros extends Model<OtrosAttributes, OtrosCreationAttributes> implements OtrosAttributes {
  declare id: number;
  declare nombres: string;
  declare parte: string;
  declare tipoParticipante: string;
  declare apellidos: string;
  declare cedula: string;
  declare idDenuncia: number;
  declare fase: string;
  declare cargo: string;
  declare institucion: string;
  declare nombre_proyecto: string;
  declare estado_notificar:"Por notificar"|"Notificado";
  declare id_notificacion:number
  declare estado_citar: 'Por citar' | 'Citado';
  declare id_citacion: number;
}

Otros.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombres: {
    type: DataTypes.STRING,
    
  },
   apellidos: {
    type: DataTypes.STRING,
    
  },
   cedula: {
    type: DataTypes.STRING,
    
  },
  parte: {
    type: DataTypes.STRING,
    
  },
   tipoParticipante: {
    type: DataTypes.STRING,
    
  },
  cargo: {
    type: DataTypes.STRING,
    
  },
  institucion: {
    type: DataTypes.STRING,
    
  },
  nombre_proyecto: {
    type: DataTypes.STRING,
  },
  idDenuncia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
  fase: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado_notificar:{type: DataTypes.STRING,
    allowNull: true},
    id_notificacion:{type: DataTypes.INTEGER,
    allowNull: true},
    estado_citar:{type: DataTypes.STRING,
    allowNull: true},
    id_citacion:{type: DataTypes.INTEGER,
    allowNull: true},

}, {
  sequelize,
  modelName: 'otros',
  tableName: 'otros',
  timestamps: false,
});


