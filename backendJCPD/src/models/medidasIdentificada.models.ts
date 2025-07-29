import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

import{medida} from './medidas_proteccion.models'
import { Afectado } from './afectado.models';
interface medidasIdentificasAttributes{
    id: number;
    idAfectado: number;
    idMedida: number;
}
interface medidasIdentificadasCreationAttributes extends Optional<medidasIdentificasAttributes,'id'>{
  
}
export class medidasIdentificadas extends Model<medidasIdentificasAttributes,medidasIdentificadasCreationAttributes> implements medidasIdentificasAttributes{
    declare id: number;
  declare idAfectado: number;
  declare idMedida: number;
}
medidasIdentificadas.init({
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    idAfectado: { 
        type: DataTypes.INTEGER,
        
      },
      idMedida: { 
        type: DataTypes.INTEGER,
        
        references: {
          model: medida,
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'medidasIdentificadas',
      tableName: 'medidasidentificadas',
      timestamps: false

})