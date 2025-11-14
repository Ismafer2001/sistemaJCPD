import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';


interface informeAnexadoAttributes {
  id: number;
  pathInforme: string;
 fileName: string;
}
interface informeAnexadoCreationAttributes extends Optional<informeAnexadoAttributes, 'id'> {}

export class InformeAnexado extends Model<informeAnexadoAttributes, informeAnexadoCreationAttributes> implements informeAnexadoAttributes {
    declare id: number;
    
    declare pathInforme: string;
    declare fileName: string;
}
    InformeAnexado.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    
    pathInforme: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'InformeAnexado',
    tableName: 'informes_anexados',
    timestamps: false
    });
