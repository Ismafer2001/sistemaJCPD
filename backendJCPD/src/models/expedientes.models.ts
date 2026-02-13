import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ExpedienteAttributes {
	id: number;
	idDenuncia: number;
	pathExpediente: string;
	filename: string;
	tipoExpediente: string;
}

export interface ExpedienteCreationAttributes extends Optional<ExpedienteAttributes, 'id'> {}

export class Expediente extends Model<ExpedienteAttributes, ExpedienteCreationAttributes> implements ExpedienteAttributes {
	declare id: number;
	declare idDenuncia: number;
	declare pathExpediente: string;
	declare filename: string;
	declare tipoExpediente: string;
}

Expediente.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		idDenuncia: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		pathExpediente: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		filename: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		tipoExpediente: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
		modelName: 'Expediente',
		tableName: 'expedientes',
		 timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
	}
);
