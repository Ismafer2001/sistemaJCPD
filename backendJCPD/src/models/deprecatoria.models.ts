import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Canton } from './cantones.models';
import { Denuncia } from './denuncia.models';

interface DeprecatoriaAttributes {
    id: number;
    idDenuncia: number;
    idCantonOrigen: number;
    idCantonDestino: number;
    codigoTramite: string;
    motivoDeInhibirse: string;
    estadoRecepcion: string;
}

interface DeprecatoriaCreationAttributes extends Optional<DeprecatoriaAttributes, 'id'> {}

export class Deprecatoria extends Model<DeprecatoriaAttributes, DeprecatoriaCreationAttributes> implements DeprecatoriaAttributes {
    declare id: number;
    declare idDenuncia: number;
    declare idCantonOrigen: number;
    declare idCantonDestino: number;
    declare codigoTramite: string;
    declare motivoDeInhibirse: string;
    declare estadoRecepcion: string;
}

Deprecatoria.init({
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
    idCantonOrigen: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Canton,
            key: 'id',
        },
    },
    idCantonDestino: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Canton,
            key: 'id',
        },
    },
    codigoTramite: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    motivoDeInhibirse: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    estadoRecepcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Deprecatoria',
    tableName: 'deprecatoria',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
});
