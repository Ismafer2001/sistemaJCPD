import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
interface TestimonioAttributes {
    id: number;
    testimonio: string;
    parte: string
    idParticipante: number;
}
interface TestimonioCreationAttributes extends Optional<TestimonioAttributes, 'id'> { 

}
export class Testimonio extends Model<TestimonioAttributes, TestimonioCreationAttributes> implements TestimonioAttributes {
    declare id: number;
    declare testimonio: string;
    declare parte: string;
    declare idParticipante: number;
}
Testimonio.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    testimonio: { type: DataTypes.TEXT, allowNull: false },
    parte: { type: DataTypes.STRING, allowNull: false },
    idParticipante: { type: DataTypes.INTEGER, allowNull: false }
},{
    sequelize,
    tableName: 'testimonios',
    modelName: 'Testimonio',
    timestamps: false
})