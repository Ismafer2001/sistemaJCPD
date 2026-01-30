import { Optional,
    Model,
    DataTypes } from "sequelize";
import sequelize from "../config/database";

interface providenciasAttributes {
    id: number;
    codigoTramite: string;
    articulos: string;
    suscribe: string;
    nombreQuienSuscribe: string;
    cargoQuienSuscribe?: string;
    institucionQuienSuscribe?: string;
    fechaSuscrito?: Date;
    pdf_providencia?: string;
    idDenuncia: number;
    disposiciones: string;
    fecha_creado?: Date;
    estatus?: "pendiente"|"en_proceso"|"completada";
}

interface providenciasCreationAttributes extends Optional<providenciasAttributes, 'id'> { 
    canton?: string;
}
export class Providencias extends Model<providenciasAttributes, providenciasCreationAttributes> implements providenciasAttributes {
 declare id: number;
 declare codigoTramite: string;
 declare suscribe: string;
 declare disposiciones: string;
 declare pdf_providencia: string;
 declare fechaSuscrito?: Date;
 declare idDenuncia: number;
 declare articulos: string;
declare nombreQuienSuscribe: string;
declare cargoQuienSuscribe: string;
declare institucionQuienSuscribe: string;
 declare estatus: "pendiente"|"en_proceso"|"completada";
 declare fecha_creado: Date;
 
}

Providencias.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    codigoTramite: { type: DataTypes.STRING, unique:true },
    disposiciones: { type: DataTypes.TEXT },
    suscribe: { type: DataTypes.STRING },
    fechaSuscrito: { type: DataTypes.DATE },
    articulos: { type: DataTypes.TEXT },
    nombreQuienSuscribe: { type: DataTypes.STRING },
    cargoQuienSuscribe: { type: DataTypes.STRING },
    institucionQuienSuscribe: { type: DataTypes.STRING },
    pdf_providencia: { type: DataTypes.STRING },
    idDenuncia: { type: DataTypes.INTEGER },
    estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
}, {
    sequelize,
    modelName: 'Providencias',
    tableName: 'Providencias',
    timestamps: true,
    createdAt: 'fecha_creado',
    updatedAt: false,
    });