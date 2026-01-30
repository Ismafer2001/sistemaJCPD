import{Model,DataTypes, Optional} from 'sequelize';
import sequelize from '../config/database';
interface medidaAttributes{
    id: number;
    medidas: string;
    idArticulo: number;
    cuerpoLegal: string;
}
interface medidaCreationAttributes extends Optional<medidaAttributes,'id'>{
  
}

export class medida extends Model<medidaAttributes,medidaCreationAttributes> implements medidaAttributes{
    declare id: number;
    declare medidas: string;
    declare idArticulo: number;
    declare cuerpoLegal: string;
}
medida.init({
    id: { type: DataTypes.INTEGER, primaryKey: true,
         autoIncrement: true },
  medidas: { type: DataTypes.STRING, allowNull: false },
  idArticulo:{type:DataTypes.INTEGER},
  cuerpoLegal: { type: DataTypes.STRING, allowNull: false },
},{
  sequelize,
  modelName: 'medida',
  tableName: 'medidas',
  timestamps: false,

})
