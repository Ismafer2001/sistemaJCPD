import{Model,DataTypes, Optional} from 'sequelize';
import sequelize from '../config/database';
interface medidaAttributes{
    id: number;
    medidas: string;
    idArticulo: number;
}
interface medidaCreationAttributes extends Optional<medidaAttributes,'id'>{
  
}

export class medida extends Model<medidaAttributes,medidaCreationAttributes> implements medidaAttributes{
    public id!: number;
    public medidas!: string;
    public idArticulo!: number;
}
medida.init({
    id: { type: DataTypes.INTEGER, primaryKey: true,
         autoIncrement: true },
  medidas: { type: DataTypes.STRING, allowNull: false },
  idArticulo:{type:DataTypes.INTEGER,allowNull: false}
},{
  sequelize,
  modelName: 'medida',
  tableName: 'medidas',
  timestamps: false,

})
