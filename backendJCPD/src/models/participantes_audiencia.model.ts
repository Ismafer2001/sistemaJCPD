  import { Model, DataTypes, Optional, } from 'sequelize';
    import sequelize from '../config/database';
import { Canton } from './cantones.models';


  interface ParticipantesAudienciaContestacionAttributes {
 id: number;
 nombres: string;
 apellidos: string;
 cedula: string;
 tipoParticipante: string;
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
declare apellidos: string;
declare cedula: string;
declare tipoParticipante: string;
declare asistio: boolean;
declare justifico: boolean;
declare manifiesta: string;

declare idAC: number;


  }
  
  ParticipantesAudienciaContestacion.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombres: { type: DataTypes.STRING  },
    apellidos: { type: DataTypes.STRING },
    
    cedula: { type: DataTypes.STRING },
    
    tipoParticipante: { type: DataTypes.STRING },
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