import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Afectado } from './afectado.models';
import { medida } from './medidas_proteccion.models';
import { InformeAnexado } from './informeAnexado.models';

interface CumpleMedidasAttributes {
    id: number;
    idMedida: number;
    cumple: boolean;
    idPath: number;
    idAfectado: number;
    estatus?: "pendiente"|"en_proceso"|"completada";
}
interface CumpleMedidasCreationAttributes extends Optional<CumpleMedidasAttributes, 'id'> {}
export class CumpleMedidas extends Model<CumpleMedidasAttributes, CumpleMedidasCreationAttributes> implements CumpleMedidasAttributes {
    declare id: number;
    declare idMedida: number;
    declare cumple: boolean;
    declare idPath: number;
    declare idAfectado: number;
    declare estatus: "pendiente"|"en_proceso"|"completada";
}

CumpleMedidas.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    idMedida: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
                      model: medida,
                      key: 'id',
                    },
    },
    cumple: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    idPath: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
                      model: InformeAnexado,
                      key: 'id',
                    },
    },
    idAfectado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
                      model: Afectado,
                      key: 'id',
                    },
    },
    estatus: {
    type: DataTypes.STRING,
    defaultValue: "pendiente",
    allowNull: false,
  },
}, {
    sequelize,
    modelName: 'CumpleMedidas',
    tableName: 'cumple_medidas',
    timestamps: false
});
