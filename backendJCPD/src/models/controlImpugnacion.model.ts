import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Resoluciones } from './resoluciones.models';

interface ControlImpugnacionAttributes {
    id: number;
    idResolucion: number;
    codigoTramite: string;
    
    resolucionImpugnada: string;
    resultadoImpugnacion: string;
    estatus?: "pendiente"|"en_proceso"|"completada";
}

interface ControlImpugnacionCreationAttributes extends Optional<ControlImpugnacionAttributes, 'id'> {}

export class ControlImpugnacion extends Model<ControlImpugnacionAttributes, ControlImpugnacionCreationAttributes> implements ControlImpugnacionAttributes {
    declare id: number;
    declare idResolucion: number;
    declare codigoTramite: string;

    declare resolucionImpugnada: string;
    declare resultadoImpugnacion: string;
    declare estatus: "pendiente"|"en_proceso"|"completada";
}

ControlImpugnacion.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idResolucion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Resoluciones,
            key: 'id',
        },
    },
    codigoTramite: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    
    resolucionImpugnada: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    resultadoImpugnacion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
}, {
    sequelize,
    modelName: 'ControlImpugnacion',
    tableName: 'control_impugnacion',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: 'fechaActualizado'
});
