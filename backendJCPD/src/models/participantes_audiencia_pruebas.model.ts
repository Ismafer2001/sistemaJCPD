  import { Model, DataTypes, Optional, } from 'sequelize';
    import sequelize from '../config/database';
import { Canton } from './cantones.models';


  interface ParticipantesAudienciaPruebasAttributes {
 id: number;
 nombres: string;
 apellidos: string;
 cedula: string;
 tipoParticipante: string;
 
parte: string;
 
 pruebas: string;
 pathPruebas: string| null;

 idAP: number;
  }
  
interface ParticipantesAudienciaPruebasCreationAttributes extends Optional<ParticipantesAudienciaPruebasAttributes, 'id'>{
  canton?: string;
}
  
  export class ParticipantesAudienciaPruebas extends Model<ParticipantesAudienciaPruebasAttributes, ParticipantesAudienciaPruebasCreationAttributes> implements ParticipantesAudienciaPruebasAttributes {
  
declare id: number;
declare nombres: string;
declare apellidos: string;
declare cedula: string;
declare tipoParticipante: string;

declare parte: string;
declare pruebas: string;
declare pathPruebas: string | null;

declare idAP: number;


  }
  
  ParticipantesAudienciaPruebas.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombres: { type: DataTypes.STRING  },
    apellidos: { type: DataTypes.STRING },
    cedula: { type: DataTypes.STRING },
    tipoParticipante: { type: DataTypes.STRING },
    parte: { type: DataTypes.STRING },
    pruebas:{type: DataTypes.TEXT},
    pathPruebas: { type: DataTypes.STRING, allowNull: true },
    idAP:{type: DataTypes.INTEGER},
    
    
  }, {
    sequelize,
    modelName: 'ParticipantesAudienciaPruebas',
    tableName: 'ParticipantesAudienciaPruebas',
    timestamps: false,
    
      
  });