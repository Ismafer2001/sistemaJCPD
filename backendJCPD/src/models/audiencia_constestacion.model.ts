  import { Model, DataTypes, Optional, } from 'sequelize';
    import sequelize from '../config/database';
import { Canton } from './cantones.models';


  interface AudienciaContestacionAttributes {
 id: number;
 codigoTramite: string;
 fecha: Date;
 hora: Date;
 instalacionAudiencia: string;
 dirigue: string;
 indica: string;
 manifiesta: string;
 pdf_audiencia_contestacion: number;
 seRatifica: String;
  afectadoManifiesta?: string;
 idDenuncia: number;
 estatus?: "pendiente"|"en_proceso"|"completada";
  }
  
interface AudienciaContestacionCreationAttributes extends Optional<AudienciaContestacionAttributes, 'id'>{
  canton?: string;
}
  
  export class AudienciaContestacion extends Model<AudienciaContestacionAttributes, AudienciaContestacionCreationAttributes> implements AudienciaContestacionAttributes {
  
    declare id: number;
    declare codigoTramite: string;
    declare fecha: Date;
    declare hora: Date;
    declare instalacionAudiencia: string;
    declare dirigue: string;
    declare indica: string;
    declare manifiesta: string;
    declare seRatifica: string;
     declare afectadoManifiesta?: string;
    declare pdf_audiencia_contestacion: number;
    declare idDenuncia: number;
    declare  estatus: "pendiente"|"en_proceso"|"completada";


  }
  
  AudienciaContestacion.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigoTramite: { type: DataTypes.STRING,unique:true  },
    seRatifica: { type: DataTypes.STRING, defaultValue: "no" },
    fecha: { type: DataTypes.DATE },
    hora: { type: DataTypes.TIME },
    instalacionAudiencia: { type: DataTypes.STRING },
    pdf_audiencia_contestacion: { type: DataTypes.BIGINT },
    dirigue: { type: DataTypes.STRING },
    indica: { type: DataTypes.TEXT },
    afectadoManifiesta: { type: DataTypes.TEXT },
    manifiesta:{type: DataTypes.TEXT},
    idDenuncia:{type: DataTypes.INTEGER},
     estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
    
  }, {
    sequelize,
    modelName: 'AudienciaContestacion',
    tableName: 'AudienciaContestacion',
    timestamps: true,
    createdAt: 'fecha_creado',
    updatedAt: false
      
  });