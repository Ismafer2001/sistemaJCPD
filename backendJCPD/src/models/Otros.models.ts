import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


interface OtrosAttributes {
  id: number;
  nombres: string;
  parte: string;
tipoParticipante?: string;
  
  idDenuncia: number;
  
}

interface OtrosCreationAttributes extends Optional<OtrosAttributes, 'id'> {}

export class Otros extends Model<OtrosAttributes, OtrosCreationAttributes> implements OtrosAttributes {
  declare id: number;
  declare nombres: string;
  declare parte: string;
  declare tipoParticipante: string;
  
  declare idDenuncia: number;
  
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
  parte: {
    type: DataTypes.STRING,
    
  },
   tipoParticipante: {
    type: DataTypes.STRING,
    
  },
  
  idDenuncia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
   
}, {
  sequelize,
  modelName: 'otros',
  tableName: 'otros',
  timestamps: false,
});


