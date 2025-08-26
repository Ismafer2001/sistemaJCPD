  import { Model, DataTypes, Optional, } from 'sequelize';
  import sequelize from '../config/database';
import { Afectado } from './afectado.models';
import { Denunciante } from './denunciante.models';
import { Denunciado } from './denunciado.models';
import { Otros } from './Otros.models';
import { Canton } from './cantones.models';
  
  interface DenunciaAttributes {
    id: number;
    grupoPrioritario:"nna"|"mujeres|adultos";
    medio?: "internet"|"presencial";
    tipo_denuncia?: "oficio"|"externa";
    num_tramite?: number;
    anio?: number;
    mes?: string;
    codigoTramite?: string;
    pdf_evidencia?: number;
    pdf_denuncia?: number;
    usuario_creador?: number;
    descripcion_hechos?: string;
    solicitud?: string;
    id_canton: number;
    estado: "activa"|"finalizada";
    estatus: "pendiente"|"en_proceso"|"completada";
  }
  
interface DenunciaCreationAttributes extends Optional<DenunciaAttributes, 'id'>{
  
}
  
  export class Denuncia extends Model<DenunciaAttributes, DenunciaCreationAttributes> implements DenunciaAttributes {
  
    declare id: number;
    declare grupoPrioritario:"nna"|"mujeres|adultos";
    declare medio:"internet"|"presencial";
    declare tipo_denuncia: "oficio"|"externa";
    declare fechaCreado: Date;
    declare fecha_modificado: Date;
    declare num_tramite: number;
    declare anio: number;
    declare mes: string;
    declare codigoTramite: string;
    declare pdf_evidencia: number;
    declare pdf_denuncia: number;
    declare usuario_creador: number;
    declare descripcion_hechos: string;
    declare solicitud: string;
    declare id_canton: number;
    declare estado: 'activa' | 'finalizada';
    declare estatus: 'pendiente' | 'en_proceso' | 'completada';
    declare canton?: Canton;
    declare afectados?:Afectado[];
    declare Denunciantes?: Denunciante[];
    declare Denunciados?: Denunciado[];
    declare otros?: Otros[];
   

  }
  
  Denuncia.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    grupoPrioritario: { type: DataTypes.STRING },
    medio: { type: DataTypes.STRING },
    tipo_denuncia: { type: DataTypes.STRING },
    num_tramite: { type: DataTypes.INTEGER },
    anio: { type: DataTypes.INTEGER },
    mes: { type: DataTypes.TEXT },
    codigoTramite: { type: DataTypes.STRING,unique:true },
    pdf_evidencia: { type: DataTypes.BIGINT },
    pdf_denuncia: { type: DataTypes.BIGINT },
    usuario_creador: { type: DataTypes.INTEGER },
    descripcion_hechos: { type: DataTypes.TEXT },
    solicitud:{ type: DataTypes.TEXT},
    id_canton:{type: DataTypes.INTEGER},
    estado:{ type: DataTypes.STRING, defaultValue:"activa"},
    estatus:{ type: DataTypes.STRING, defaultValue:"pendiente"},
  }, {
    sequelize,
    modelName: 'Denuncia',
    tableName: 'denuncia',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
      
  });
  