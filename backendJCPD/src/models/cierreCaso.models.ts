import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Denuncia } from './denuncia.models';

interface CierreCasoAttributes {
    id: number;
    idDenuncia: number;
    codigoTramite: string;
    conclusion: string;
    secretariaAuxiliar: string;
    estatus?: "pendiente"|"en_proceso"|"completada";
}

interface CierreCasoCreationAttributes extends Optional<CierreCasoAttributes, 'id'> {}

export class CierreCaso extends Model<CierreCasoAttributes, CierreCasoCreationAttributes> implements CierreCasoAttributes {
    declare id: number;
    declare idDenuncia: number;
    declare codigoTramite: string;
    declare conclusion: string;
    declare secretariaAuxiliar: string;
    declare  estatus: "pendiente"|"en_proceso"|"completada";
}

CierreCaso.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idDenuncia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Denuncia,
            key: 'id',
        },
    },
    codigoTramite: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    conclusion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    secretariaAuxiliar: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
  estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
}, {
    sequelize,
    modelName: 'CierreCaso',
    tableName: 'cierre_caso',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
});
