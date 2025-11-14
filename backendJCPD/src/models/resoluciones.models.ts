import { Optional,
    Model,
    DataTypes } from "sequelize";
import sequelize from "../config/database";

interface resolucionesAttributes {
    id: number;
    codigoTramite: string;
    consideraciones: string;
    resolucion: string;
    pdf_resolucion?: string;
    idDenuncia: number;
    estatus?: "pendiente"|"en_proceso"|"completada";
}

interface resolucionesCreationAttributes extends Optional<resolucionesAttributes, 'id'> { 
    canton?: string;
}
export class Resoluciones extends Model<resolucionesAttributes, resolucionesCreationAttributes> implements resolucionesAttributes {
 declare id: number;
 declare codigoTramite: string;
 declare consideraciones: string;
 declare resolucion: string;
 declare pdf_resolucion: string;
 declare idDenuncia: number;
 declare estatus: "pendiente"|"en_proceso"|"completada";
 
}

Resoluciones.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigoTramite: { type: DataTypes.STRING, unique:true },
    consideraciones: { type: DataTypes.TEXT },
    resolucion: { type: DataTypes.TEXT },
    pdf_resolucion: { type: DataTypes.STRING },
    idDenuncia: { type: DataTypes.INTEGER },
    estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
}, {
    sequelize,
    modelName: 'Resoluciones',
    tableName: 'Resoluciones',
    timestamps: true,
    createdAt: 'fecha_creado',
    updatedAt: false,
    });