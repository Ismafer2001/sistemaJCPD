import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CantonAttributes {
  id: number;
  canton: string;
}

type CantonCreationAttributes = Optional<CantonAttributes, 'id'>;

export class Canton extends Model<CantonAttributes, CantonCreationAttributes>
  implements CantonAttributes {
  declare id: number;
  declare canton: string;
}

Canton.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  canton: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'canton',
  modelName: 'Canton',
  timestamps: false,
});