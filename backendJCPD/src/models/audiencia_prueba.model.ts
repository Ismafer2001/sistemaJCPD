  import { Model, DataTypes, Optional, } from 'sequelize';
    import sequelize from '../config/database';
import { Canton } from './cantones.models';


  interface AudienciaPruebasAttributes {
 id: number;
 codigoTramite: string;
 fecha: Date;
 hora: Date;
 instalacionAudiencia: string;
 pdf_audiencia_pruebas: string;
 idDenuncia: number;
 afectadoManifiesta?: string;
 articulo: string;
  estatus?: "pendiente"|"en_proceso"|"completada";
  }
  
interface AudienciaPruebasCreationAttributes extends Optional<AudienciaPruebasAttributes, 'id'>{
  canton?: string;
}
  
  export class AudienciaPruebas extends Model<AudienciaPruebasAttributes, AudienciaPruebasCreationAttributes> implements AudienciaPruebasAttributes {
  
    declare id: number;
    declare codigoTramite: string;
    declare fecha: Date;
    declare hora: Date;
    declare instalacionAudiencia: string;
    declare pdf_audiencia_pruebas: string;
    declare idDenuncia: number;
    declare afectadoManifiesta?: string;
    declare articulo: string;
    declare  estatus: "pendiente"|"en_proceso"|"completada";
     


  }
  
  AudienciaPruebas.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigoTramite: { type: DataTypes.STRING,unique:true  },
    fecha: { type: DataTypes.DATE },
    hora: { type: DataTypes.TIME },
    instalacionAudiencia: { type: DataTypes.STRING },
    pdf_audiencia_pruebas: { type: DataTypes.STRING },
    afectadoManifiesta: { type: DataTypes.STRING },
    articulo: { type: DataTypes.STRING },
    idDenuncia:{type: DataTypes.INTEGER},
     estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
    
  }, {
    sequelize,
    modelName: 'AudienciaPruebas',
    tableName: 'AudienciaPruebas',
    timestamps: true,
    createdAt: 'fecha_creado',
    updatedAt: false
      
  });