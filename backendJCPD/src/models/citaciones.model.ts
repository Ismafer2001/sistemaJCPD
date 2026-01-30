import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";

interface CitacionAttributes {
  id: number;
  codigoTramite: string;
  
  
  fecha: Date;
  local: string;
  hora: string;
  direccion: string;
  diriguidoA: string;
  razon: string;
  idUsuario: number;
  parte: string;
  idDenuncia: number;
  estatus: "pendiente"|"en_proceso"|"completada";
}

interface CitacionCreationAttributes
  extends Optional<CitacionAttributes, "id"> {}

export class Citacion
  extends Model<CitacionAttributes, CitacionCreationAttributes>
  implements CitacionAttributes
{
  declare id: number;
  declare codigoTramite: string;
  
  declare fecha: Date;
  declare local: string;
  declare hora: string;
  declare direccion: string;
  declare diriguidoA: string;
  declare razon: string;
  declare parte: string;
  declare estatus: "pendiente"|"en_proceso"|"completada";
  declare idUsuario: number;
  declare idDenuncia: number;
}

Citacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigoTramite: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     
    
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
     local: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     hora: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parte: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    razon:{
      type: DataTypes.TEXT,
    },
    estatus: {
      type: DataTypes.STRING,
      defaultValue: "pendiente",
      allowNull: false,
    },
    
    idDenuncia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "denuncia",
        key: "id",
      },
    },

    diriguidoA: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Citacion",
    tableName: "Citacion",
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
  }
);
