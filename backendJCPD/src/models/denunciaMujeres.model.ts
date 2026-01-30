  import { Model, DataTypes, Optional, } from 'sequelize';
  import sequelize from '../config/database';
import { Denuncia } from './denuncia.models';

  
  interface DenunciaMujeresAttributes {
    idDenuncia: number;
    tipoDeViolencia?: string;
    ambitoViolencia?: string;
  }
  
interface DenunciaMujeresCreationAttributes extends Optional<DenunciaMujeresAttributes, 'idDenuncia'>{
  
}
  
  export class DenunciaMujeres extends Model<DenunciaMujeresAttributes, DenunciaMujeresCreationAttributes> implements DenunciaMujeresAttributes {
  
    declare idDenuncia: number;
    declare tipoDeViolencia: string;
    declare ambitoViolencia: string;
   

  }
  
  DenunciaMujeres.init({
    idDenuncia: { type: DataTypes.INTEGER, primaryKey: true, // Es PK
    references: {
      model: Denuncia, // Nombre de la tabla padre
      key: 'id'
    } },
    tipoDeViolencia: { type: DataTypes.STRING },
    ambitoViolencia: { type: DataTypes.STRING },
  }, {
    sequelize,
    modelName: 'DenunciaMujeres',
    tableName: 'denuncia_mujeres',
    timestamps: true,
    createdAt: 'fechaCreado',
    updatedAt: false
      
  });
  