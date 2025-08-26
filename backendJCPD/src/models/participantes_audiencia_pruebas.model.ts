  import { Model, DataTypes, Optional, } from 'sequelize';
    import sequelize from '../config/database';
import { Canton } from './cantones.models';


  interface ParticipantesAudienciaPruebasAttributes {
 id: number;
 nombres: string;
 cedula: string;
 tipo_involucrado: string;
 asistio: boolean;
 
 pruebas: string;
 pdfAudienciaPruebas: number;
 idAudienciaPruebas: number;
  }
  
interface ParticipantesAudienciaPruebasCreationAttributes extends Optional<ParticipantesAudienciaPruebasAttributes, 'id'>{
  canton?: string;
}
  
  export class ParticipantesAudienciaPruebas extends Model<ParticipantesAudienciaPruebasAttributes, ParticipantesAudienciaPruebasCreationAttributes> implements ParticipantesAudienciaPruebasAttributes {
  
declare id: number;
declare nombres: string;
declare cedula: string;
declare tipo_involucrado: string;
declare asistio: boolean;

declare pruebas: string;
declare pdfAudienciaPruebas: number;
declare idAudienciaPruebas: number;


  }
  
  ParticipantesAudienciaPruebas.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombres: { type: DataTypes.STRING,unique:true  },
    
    cedula: { type: DataTypes.STRING },
    
    tipo_involucrado: { type: DataTypes.STRING },
    asistio: { type: DataTypes.BOOLEAN },
    
    pruebas:{type: DataTypes.STRING},
    pdfAudienciaPruebas:{type: DataTypes.INTEGER},
    idAudienciaPruebas:{type: DataTypes.INTEGER},
    
  }, {
    sequelize,
    modelName: 'ParticipantesAudienciaPruebas',
    tableName: 'ParticipantesAudienciaPruebas',
    timestamps: false,
    
      
  });