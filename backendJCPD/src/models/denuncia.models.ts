  import { Model, DataTypes, Optional, } from 'sequelize';
  import sequelize from '../config/database';
  
  interface DenunciaAttributes {
    id: number;
    grupoPrioritario:"nna"|"mujeres|adultos";
    medio?: "internet"|"presencial";
    tipo_denuncia?: "oficio"|"externa";
    fecha_creado?: Date;
    fecha_modificado?: Date;
    canton?: string;
    num_tramite?: number;
    anio?: number;
    mes?: string;
    codigoTramite?: string;
    pdf_evidencia?: number;
    pdf_denuncia?: number;
    usuario_creador?: number;
    descripcion_hechos?: string;
    solicitud?: string;
  }
  
interface DenunciaCreationAttributes extends Optional<DenunciaAttributes, 'id'>{

}
  
  export class Denuncia extends Model<DenunciaAttributes, DenunciaCreationAttributes> implements DenunciaAttributes {
  
    public id!: number;
    public grupoPrioritario!:"nna"|"mujeres|adultos";
    public medio!:"internet"|"presencial";
    public tipo_denuncia!: "oficio"|"externa";
    public fecha_creado!: Date;
    public fecha_modificado!: Date;
    public canton!: string;
    public num_tramite!: number;
    public anio!: number;
    public mes!: string;
    public tramite!: string;
    public pdf_evidencia!: number;
    public pdf_denuncia!: number;
    public usuario_creador!: number;
    public descripcion_hechos!: string;
    public solicitud?: string;
  }
  
  Denuncia.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    grupoPrioritario: { type: DataTypes.STRING },
    medio: { type: DataTypes.STRING },
    tipo_denuncia: { type: DataTypes.STRING },
    fecha_creado: { type: DataTypes.DATE },
    fecha_modificado: { type: DataTypes.DATE },
    canton: { type: DataTypes.STRING },
    num_tramite: { type: DataTypes.BIGINT },
    anio: { type: DataTypes.INTEGER },
    mes: { type: DataTypes.TEXT },
    codigoTramite: { type: DataTypes.STRING },
    pdf_evidencia: { type: DataTypes.BIGINT },
    pdf_denuncia: { type: DataTypes.BIGINT },
    usuario_creador: { type: DataTypes.INTEGER },
    descripcion_hechos: { type: DataTypes.TEXT },
    solicitud:{ type: DataTypes.TEXT}
  }, {
    sequelize,
    modelName: 'Denuncia',
    tableName: 'denuncia',
    timestamps: false
  });
  