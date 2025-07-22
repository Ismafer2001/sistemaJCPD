  import { Model, DataTypes, Optional, } from 'sequelize';
  import sequelize from '../config/database';
  
  interface DenunciaAttributes {
    id: number;
    grupoPrioritario:"nna"|"mujeres|adultos";
    medio?: "internet"|"presencial";
    tipo_denuncia?: "oficio"|"externa";
    fecha_creado?: Date;
    fecha_modificado?: Date;
    
    num_tramite?: number;
    anio?: number;
    mes?: string;
    codigoTramite?: string;
    pdf_evidencia?: number;
    pdf_denuncia?: number;
    usuario_creador?: number;
    descripcion_hechos?: string;
    solicitud?: string;
    id_canton: string;
    estado: "activa"|"finalizada";
  }
  
interface DenunciaCreationAttributes extends Optional<DenunciaAttributes, 'id'>{
  canton?: string;
}
  
  export class Denuncia extends Model<DenunciaAttributes, DenunciaCreationAttributes> implements DenunciaAttributes {
  
    declare id: number;
    declare grupoPrioritario:"nna"|"mujeres|adultos";
    declare medio:"internet"|"presencial";
    declare tipo_denuncia: "oficio"|"externa";
    declare fecha_creado: Date;
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
    declare id_canton: string;
    declare estado: 'activa' | 'finalizada';
    declare canton: string;
  }
  
  Denuncia.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    grupoPrioritario: { type: DataTypes.STRING },
    medio: { type: DataTypes.STRING },
    tipo_denuncia: { type: DataTypes.STRING },
    fecha_creado: { type: DataTypes.DATE },
    fecha_modificado: { type: DataTypes.DATE },
    
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
  }, {
    sequelize,
    modelName: 'Denuncia',
    tableName: 'denuncia',
    timestamps: true,
    createdAt: 'fecha_creado',
    updatedAt: false
      
  });
  