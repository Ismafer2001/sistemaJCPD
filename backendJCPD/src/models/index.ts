import sequelize from '../config/database';
import { Usuario } from './usuarios.models';
import { Canton } from './cantones.models';
import { Afectado } from './afectado.models';
import { Denuncia } from './denuncia.models';
import { Denunciado } from './denunciado.models';
import { Denunciante } from './denunciante.models';
import { Hecho } from './hechos.models';
import { Vulneracion } from './vulneraciones.models';
import { VulneracionIdentificada } from './vulIdentificadas.models';
 
//relacion usuario -- canton
Usuario.belongsTo(Canton, { foreignKey: 'id_canton', as: 'canton' });
Canton.hasMany(Usuario, { foreignKey: 'id_canton' });
//relacion afectado denuncia
Denuncia.hasMany(Afectado, { foreignKey: 'idDenuncia', as:'afectados'});
Afectado.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });
//relacion denunciado denuncia
Denuncia.hasMany(Denunciado, { foreignKey: 'idDenuncia', as: 'denunciados' });
Denunciado.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });
//relacion denunciante denuncia
Denuncia.hasOne(Denunciante, { foreignKey: 'idDenuncia', as: 'denunciante' });
Denunciante.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });
//relacion hecho denuncia
Denuncia.hasOne(Hecho, { foreignKey: 'idDenuncia', as: 'hecho' });
Hecho.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });
// Relación muchos a muchos hechos y vulneracion
Hecho.belongsToMany(Vulneracion, {
  through: VulneracionIdentificada,
  foreignKey: 'hechoId',
  as: 'vulneraciones'
});
Vulneracion.belongsToMany(Hecho, {
  through: VulneracionIdentificada,
  foreignKey: 'vulneracionId',
  as: 'hechos'
});

export { sequelize, Usuario, Canton,Denuncia,Afectado,Denunciado,Denunciante,Hecho, Vulneracion, VulneracionIdentificada };

