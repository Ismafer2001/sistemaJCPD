// models/afectado.model.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AfectadoAttributes {
  id: number;
  cedula: number;
  nombre: string;
  apellido: string;
  sexo: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
  idDenuncia: number;
}

interface AfectadoCreationAttributes extends Optional<AfectadoAttributes, 'id'> {}

export class Afectado extends Model<AfectadoAttributes, AfectadoCreationAttributes> implements AfectadoAttributes {
  public id!: number;
  public cedula!: number;
  public nombre!: string;
  public apellido!: string;
  public sexo!: string;
  public nacionalidad!: string;
  public direccion!: string;
  public mail!: string;
  public telefono!: string;
  public idDenuncia!: number;
}

Afectado.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cedula: {
    type: DataTypes.STRING,
    
  },
  nombre: {
    type: DataTypes.STRING,
    
  },
  apellido: {
    type: DataTypes.STRING,
   
  },
  sexo: {
    type: DataTypes.STRING,
    
  },
  nacionalidad: {
    type: DataTypes.STRING,
    
  },
  direccion: {
    type: DataTypes.STRING,
    
  },
  mail: {
    type: DataTypes.STRING,
    
  },
  telefono: {
    type: DataTypes.STRING,
    
  },
  idDenuncia: {
    type: DataTypes.INTEGER,
    allowNull:false,
    
  }
}, {
  sequelize,
  tableName: 'afectado',
  modelName: 'Afectado',
  timestamps: false,
});
