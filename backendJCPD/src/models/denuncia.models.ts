import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DenunciaAttributes {
  id: number;
  medio?: string;
  tipo_denuncia?: string;
  fecha_creado?: Date;
  fecha_modificado?: Date;
  canton?: string;
  num_tramite?: number;
  anio?: number;
  mes?: string;
  tramite?: string;
  pdf_evidencia?: number;
  pdf_denuncia?: number;
  usuario_creador?: number;
  descripcion_hechos?: string;
}

export type DenunciaCreationAttributes = Optional<DenunciaAttributes, 'id'>;

export class Denuncia extends Model<DenunciaAttributes, DenunciaCreationAttributes> implements DenunciaAttributes {
  public id!: number;
  public medio!: string;
  public tipo_denuncia!: string;
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
}

Denuncia.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  medio: { type: DataTypes.STRING },
  tipo_denuncia: { type: DataTypes.STRING },
  fecha_creado: { type: DataTypes.DATE },
  fecha_modificado: { type: DataTypes.DATE },
  canton: { type: DataTypes.STRING },
  num_tramite: { type: DataTypes.BIGINT },
  anio: { type: DataTypes.INTEGER },
  mes: { type: DataTypes.TEXT },
  tramite: { type: DataTypes.STRING },
  pdf_evidencia: { type: DataTypes.BIGINT },
  pdf_denuncia: { type: DataTypes.BIGINT },
  usuario_creador: { type: DataTypes.INTEGER },
  descripcion_hechos: { type: DataTypes.TEXT },
}, {
  sequelize,
  modelName: 'Denuncia',
  tableName: 'denuncia',
  timestamps: false
});
