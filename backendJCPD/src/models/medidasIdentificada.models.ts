import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Denuncia } from './denuncia.models';
import{medida} from './medidas_proteccion.models'
interface medidasIdentificasAttributes{
    id: number;
    afectado_id: number;
    medidas_id: number;
}
interface medidasIdentificadasCreationAttributes extends Optional<medidasIdentificasAttributes,'id'>{
  
}
export class medidasIdentificadas extends Model<medidasIdentificasAttributes,medidasIdentificadasCreationAttributes> implements medidasIdentificasAttributes{
    public id!: number;
  public afectado_id!: number;
  public medidas_id!: number;
}
medidasIdentificadas.init({
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    afectado_id: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Denuncia,
          key: 'id'
        }
      },
      medidas_id: { 
        type: DataTypes.INTEGER,
        allowNull: false,
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