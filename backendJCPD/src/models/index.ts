import sequelize from '../config/database';
import { Usuario } from './usuarios.models';
import { Canton } from './cantones.models';
import { Afectado } from './afectado.models';
import { Denuncia } from './denuncia.models';
import { Denunciado } from './denunciado.models';
import { Denunciante } from './denunciante.models';

import { Vulneracion } from './vulneraciones.models';
import { VulneracionesIdentificadas } from './vulneracionesidentificadas.models';
 
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



// Relación muchos a muchos entre Denuncia y Vulneracion
Denuncia.belongsToMany(Vulneracion, {
  through: VulneracionesIdentificadas,
  foreignKey: 'denuncia_id'
});

Vulneracion.belongsToMany(Denuncia, {
  through: VulneracionesIdentificadas,
  foreignKey: 'vulneracion_id'
});

export {
  sequelize,
  Denuncia,
  Vulneracion,
  VulneracionesIdentificadas,
  Denunciante,
  Denunciado,
  Afectado,

  Usuario,
  Canton
};

