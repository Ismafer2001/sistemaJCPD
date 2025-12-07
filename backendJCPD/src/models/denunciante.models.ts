// models/denunciante.model.ts
import { Model, DataTypes, Optional} from 'sequelize';
import sequelize from '../config/database';

interface DenuncianteAttributes {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  genero: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
parentezco: string;
  idDenuncia: number;

}

interface DenuncianteCreationAttributes extends Optional<DenuncianteAttributes, 'id'> {}

export class Denunciante extends Model<DenuncianteAttributes, DenuncianteCreationAttributes>
  implements DenuncianteAttributes {
  
  public id!: number;
  public cedula!: string;
  public nombres!: string;
  public apellidos!: string;
  public edad!: number;
  public sexo!: string;
  public genero!: string;
  public nacionalidad!: string;
  public direccion!: string;
  public mail!: string;
  public telefono!: string;
  public parentezco!: string;
  public idDenuncia!: number;
}

Denunciante.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cedula: {
    type: DataTypes.STRING,
    
  },
  nombres: {
    type: DataTypes.STRING,
    
  },
  apellidos: {
    type: DataTypes.STRING,
    
  },
  edad: {
    type: DataTypes.INTEGER,
    
  },
  sexo: {
    type: DataTypes.STRING,
    
  },
  genero: {
    type: DataTypes.STRING,
    
  },
  nacionalidad: {
    type: DataTypes.STRING,
    
  },
  direccion: {
    type: DataTypes.STRING,
    
  },
  mail: {
    type: DataTypes.STRING,
    
  },
  telefono: {
    type: DataTypes.STRING,
    
  },
  parentezco: {
    type: DataTypes.STRING,
    
  },
  idDenuncia: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'denunciante',
  modelName: 'Denunciante',
  timestamps: false,
});




