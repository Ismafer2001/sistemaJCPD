import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CierreCaso } from './cierreCaso.models';

interface InformesPresentadosAttributes {
    id: number;
    idCierraCaso: number;
    informe: string;
    nombreTecnico: string;
    lugar: string;
    personaEvaluada: string;
}

interface InformesPresentadosCreationAttributes extends Optional<InformesPresentadosAttributes, 'id'> {}

export class InformesPresentados extends Model<InformesPresentadosAttributes, InformesPresentadosCreationAttributes> implements InformesPresentadosAttributes {
    declare id: number;
    declare idCierraCaso: number;
    declare informe: string;
    declare nombreTecnico: string;
    declare lugar: string;
    declare personaEvaluada: string;
}

InformesPresentados.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idCierraCaso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CierreCaso,
            key: 'id',
        },
    },
    informe: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    nombreTecnico: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    lugar: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    personaEvaluada: {
        type: DataTypes.STRING(255),
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'InformesPresentados',
    tableName: 'informes_presentados',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
});
