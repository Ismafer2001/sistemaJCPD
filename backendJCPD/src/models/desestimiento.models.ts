import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

import { Denuncia } from './denuncia.models';

interface DesestimientoAttributes {
    id: number;
    idDenuncia: number;
    codigoTramite: string;
    resultado_desestimiento: string;
   
    estatus?: "pendiente"|"en_proceso"|"completada";
}

interface DesestimientoCreationAttributes extends Optional<DesestimientoAttributes, 'id'> {}

export class Desestimiento extends Model<DesestimientoAttributes, DesestimientoCreationAttributes> implements DesestimientoAttributes {
    declare id: number;
    declare idDenuncia: number;
    declare codigoTramite: string;
    declare resultado_desestimiento: string;
    
    declare estatus: "pendiente"|"en_proceso"|"completada";
}

Desestimiento.init({
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
        unique: true,
    },
    
    resultado_desestimiento: {
        type: DataTypes.STRING,
    },
    

    estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
}, {
    sequelize,
    modelName: 'Desestimiento',
    tableName: 'desestimiento',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: 'fechaActualizado'
});
