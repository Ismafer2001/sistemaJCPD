import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ArticuloAttributes {
  id: number;
  articulo: string;
  
}

interface ArticuloCreationAttributes extends Optional<ArticuloAttributes, 'id'>{

}

export class articulo extends Model<ArticuloAttributes, ArticuloCreationAttributes> implements ArticuloAttributes {
  public id!: number;
  public articulo!: string;
  
}
articulo.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  articulo: { type: DataTypes.STRING },
  
}, {
  sequelize,
  modelName: 'articulo',
  tableName: 'articulos',
  timestamps: false
});