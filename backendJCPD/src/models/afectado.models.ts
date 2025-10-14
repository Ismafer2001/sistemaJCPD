// models/afectado.model.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { medidasIdentificadas } from './medidasIdentificada.models';
import { MedidasEmergentes } from './medidas_emergentes.model';
import { VulneracionesIdentificadas } from './vulneracionesidentificadas.models';

interface AfectadoAttributes {
  id: number;
  cedula: number;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  genero: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
  idDenuncia: number;
}

interface AfectadoCreationAttributes extends Optional<AfectadoAttributes, 'id'> {
  
}

export class Afectado extends Model<AfectadoAttributes, AfectadoCreationAttributes> implements AfectadoAttributes {
  declare id: number;
  declare cedula: number;
  declare nombres: string;
  declare apellidos: string;
  declare edad: number;
  declare sexo: string;
  declare genero: string;
  declare nacionalidad: string;
  declare direccion: string;
  declare mail: string;
  declare telefono: string;
  declare idDenuncia: number;
  declare medidasI: medidasIdentificadas[];
  declare medidasE: MedidasEmergentes[];
  declare vulneracionesI?: VulneracionesIdentificadas[];
  
  
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
  nombres: {
    type: DataTypes.STRING,
    
  },
  apellidos: {
    type: DataTypes.STRING,
   
  },
  edad: {
    type: DataTypes.INTEGER,
    
  },
  sexo: {
    type: DataTypes.STRING,
    
  },
  genero:{
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
