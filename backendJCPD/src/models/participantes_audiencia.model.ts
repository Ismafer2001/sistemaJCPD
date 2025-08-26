  import { Model, DataTypes, Optional, } from 'sequelize';
    import sequelize from '../config/database';
import { Canton } from './cantones.models';


  interface ParticipantesAudienciaContestacionAttributes {
 id: number;
 nombres: string;
 cedula: string;
 tipo_involucrado: string;
 asistio: boolean;
 justifico: boolean;
 manifiesta: string;
 
 idAC: number;
  }
  
interface ParticipantesAudienciaContestacionCreationAttributes extends Optional<ParticipantesAudienciaContestacionAttributes, 'id'>{
  canton?: string;
}
  
  export class ParticipantesAudienciaContestacion extends Model<ParticipantesAudienciaContestacionAttributes, ParticipantesAudienciaContestacionCreationAttributes> implements ParticipantesAudienciaContestacionAttributes {
  
declare id: number;
declare nombres: string;
declare cedula: string;
declare tipo_involucrado: string;
declare asistio: boolean;
declare justifico: boolean;
declare manifiesta: string;

declare idAC: number;


  }
  
  ParticipantesAudienciaContestacion.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombres: { type: DataTypes.STRING,unique:true  },
    
    cedula: { type: DataTypes.STRING },
    
    tipo_involucrado: { type: DataTypes.STRING },
    asistio: { type: DataTypes.BOOLEAN },
    justifico: { type: DataTypes.BOOLEAN },
    
    manifiesta:{type: DataTypes.STRING},
    
    idAC:{type: DataTypes.INTEGER},
    
  }, {
    sequelize,
    modelName: 'ParticipantesAudienciaContestacion',
    tableName: 'ParticipantesAudienciaContestacion',
    timestamps: false,
    
      
  });