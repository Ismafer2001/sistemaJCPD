  import { Model, DataTypes, Optional, } from 'sequelize';
    import sequelize from '../config/database';
import { Canton } from './cantones.models';


  interface AudienciaPruebasAttributes {
 id: number;
 codigoTramite: string;
 fecha: Date;
 hora: Date;
 instalacionAudiencia: string;
 pdf_audiencia_pruebas: number;
 idDenuncia: number;
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
    

    declare pdf_audiencia_pruebas: number;
    declare idDenuncia: number;


  }
  
  AudienciaPruebas.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigoTramite: { type: DataTypes.STRING,unique:true  },
    
    
    fecha: { type: DataTypes.DATE },
    hora: { type: DataTypes.TIME },
    instalacionAudiencia: { type: DataTypes.STRING },
    pdf_audiencia_pruebas: { type: DataTypes.BIGINT },
    
    idDenuncia:{type: DataTypes.INTEGER},
    
  }, {
    sequelize,
    modelName: 'AudienciaPruebas',
    tableName: 'AudienciaPruebas',
    timestamps: true,
    createdAt: 'fecha_creado',
    updatedAt: false
      
  });