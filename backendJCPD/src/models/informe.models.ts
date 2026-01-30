import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Denuncia } from './denuncia.models';

interface InformeAttributes {
    id: number;
    idDenuncia: number;
    nombre: string;
    dirigidoA: string;
    numeroOficio: string;
    codigoTramite: string;
    transcripcion: string;
}

interface InformeCreationAttributes extends Optional<InformeAttributes, 'id'> {}

export class Informe extends Model<InformeAttributes, InformeCreationAttributes> implements InformeAttributes {
    declare id: number;
    declare idDenuncia: number;
    declare nombre: string;
    declare dirigidoA: string;
    declare numeroOficio: string;
    declare codigoTramite: string;
    declare transcripcion: string;
}

Informe.init({
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
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    dirigidoA: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    numeroOficio: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    codigoTramite: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    transcripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Informe',
    tableName: 'informe',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
});
