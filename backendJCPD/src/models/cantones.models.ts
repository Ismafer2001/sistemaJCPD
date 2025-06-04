import { Model, DataTypes } from 'sequelize';
import { sequelize } from "../config/database";

export class Canton extends Model {
  public id!: Number;
  public nombre!: string;
}

Canton.init({
  id: {
    
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Canton',
  tableName: 'cantones',
  timestamps: false,
});

