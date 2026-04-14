  import { Model, DataTypes, Optional, } from 'sequelize';
  import sequelize from '../config/database';
import { Afectado } from './afectado.models';
import { Denunciante } from './denunciante.models';
import { Denunciado } from './denunciado.models';
import { Otros } from './Otros.models';
import { Canton } from './cantones.models';
import { Avocatoria } from './avocatoria.model';
import { Notificacion } from './notificacion.model';
  
  interface DenunciaAttributes {
    id: number;
    grupoPrioritario:"nna"|"mujeres"|"adultos";
    medio?: "internet"|"presencial";
    tipo_denuncia?: "oficio"|"externa";
    num_tramite?: number;
    anio: number;
    
    codigoTramite?: string;
    usuario_creador?: number;
    descripcion_hechos: string;
    solicitud: string;
    id_canton: number;
    estado: "activa"|"finalizada"|'remitido';
    estatus: "pendiente"|"en_proceso"|"completada";
  }
  
interface DenunciaCreationAttributes extends Optional<DenunciaAttributes, 'id'>{
  
}
  
  export class Denuncia extends Model<DenunciaAttributes, DenunciaCreationAttributes> implements DenunciaAttributes {
  
    declare id: number;
    declare grupoPrioritario:"nna"|"mujeres"|"adultos";
    declare medio:"internet"|"presencial";
    declare tipo_denuncia: "oficio"|"externa";
    declare fechaCreado: Date;
    declare fecha_modificado: Date;
    declare num_tramite: number;
    declare anio: number;
    declare codigoTramite: string;
    declare usuario_creador: number;
    declare descripcion_hechos: string;
    declare solicitud: string;
    declare id_canton: number;
    declare estado: 'activa' | 'finalizada'|'remitido';
    declare estatus: 'pendiente' | 'en_proceso' | 'completada';
    declare canton?: Canton;
    declare afectados?:Afectado[];
    declare Denunciantes?: Denunciante[];
    declare Denunciados?: Denunciado[];
    declare otros?: Otros[];
    declare avocatoria?: Avocatoria;
    declare Notificacions?: Notificacion[];
    
   

  }
  
  Denuncia.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    grupoPrioritario: { type: DataTypes.STRING,allowNull:false },
    medio: { type: DataTypes.STRING,allowNull:false },
    tipo_denuncia: { type: DataTypes.STRING,allowNull:false },
    num_tramite: { type: DataTypes.INTEGER,allowNull:false },
    anio: { type: DataTypes.INTEGER,allowNull:false },
    
    codigoTramite: { type: DataTypes.STRING,unique:true,allowNull:false },
    usuario_creador: { type: DataTypes.INTEGER,allowNull:true },
    descripcion_hechos: { type: DataTypes.TEXT,allowNull:false },
    solicitud:{ type: DataTypes.TEXT,allowNull:false},
    id_canton:{type: DataTypes.INTEGER,allowNull:false},
    estado:{ type: DataTypes.STRING, defaultValue:"activa",allowNull:false},
    estatus:{ type: DataTypes.STRING, defaultValue:"pendiente",allowNull:false},
  }, {
    sequelize,
    modelName: 'Denuncia',
    tableName: 'denuncia',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
      
  });
  