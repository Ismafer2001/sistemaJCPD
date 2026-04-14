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
  estado_notificar:"Por notificar"|"Notificado";
  id_notificacion: number

}

interface DenuncianteCreationAttributes extends Optional<DenuncianteAttributes, 'id'> {}

export class Denunciante extends Model<DenuncianteAttributes, DenuncianteCreationAttributes>
  implements DenuncianteAttributes {
  
  declare id: number;
  declare cedula: string;
  declare nombres: string;
  declare apellidos: string;
  declare edad: number;
  declare sexo: string;
  declare genero: string;
  declare nacionalidad: string;
  declare direccion: string;
  declare mail: string;
  declare telefono: string;
  declare parentezco: string;
  declare idDenuncia: number;
  declare estado_notificar:"Por notificar"|"Notificado";
  declare id_notificacion:number
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
  },
  estado_notificar:{type: DataTypes.STRING,
    allowNull: true},
    id_notificacion:{type: DataTypes.INTEGER,
    allowNull: true},
}, {
  sequelize,
  tableName: 'denunciante',
  modelName: 'Denunciante',
  timestamps: false,
});




