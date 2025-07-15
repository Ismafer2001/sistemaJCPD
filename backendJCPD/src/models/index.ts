
import { usuarios } from './usuarios.models';
import { Canton } from './cantones.models';
import { Afectado } from './afectado.models';
import { Denuncia } from './denuncia.models';
import { Denunciado } from './denunciado.models';
import { Denunciante } from './denunciante.models';
import { Vulneracion } from './vulneraciones.models';
import { VulneracionesIdentificadas } from './vulneracionesidentificadas.models';
import { medida } from './medidas_proteccion.models';
import { medidasIdentificadas } from './medidasIdentificada.models';
import { articulo } from './articulo_medidas.models';

//relacion usuario -- canton
usuarios.belongsTo(Canton, { foreignKey: 'id_canton', as: 'canton' });
Canton.hasMany(usuarios, { foreignKey: 'id_canton' });

//relacion afectado denuncia
Denuncia.hasMany(Afectado, { foreignKey: 'idDenuncia', as:'afectados'});
Afectado.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });

//relacion denunciado denuncia
Denuncia.hasMany(Denunciado, { foreignKey: 'idDenuncia', as: 'denunciados' });
Denunciado.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });

//relacion denunciante denuncia
Denuncia.hasMany(Denunciante, { foreignKey: 'idDenuncia', as: 'denunciante' });
Denunciante.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });

// Relación muchos a muchos entre afectado y Vulneracion
Afectado.belongsToMany(Vulneracion, {
  through: VulneracionesIdentificadas,
  as:'vulneraciones',
  foreignKey: 'afectado_id'
});

Vulneracion.belongsToMany(Afectado, {
  
  through: VulneracionesIdentificadas,
  as:'afectados',
  
  foreignKey: 'vulneracion_id'
});
// Relación muchos a muchos entre afectados y medidas
Afectado.belongsToMany(medida, {
  through: medidasIdentificadas,
  as:'medidas',
  foreignKey: 'afectado_id'
});

medida.belongsToMany(Afectado, {
  
  through: medidasIdentificadas,
  as:'afectado',
  
  foreignKey: 'medidas_id'
});

// Relación entre medida y articulo
medida.belongsTo(articulo, {
  foreignKey: 'idArticulo',
  as: 'articulos'
});

articulo.hasMany(medida, {
  foreignKey: 'idArticulo',
  as: 'medidas'
});




export {
  Denuncia,
  Vulneracion,
  VulneracionesIdentificadas,
  Denunciante,
  Denunciado,
  Afectado,
  medida,
  medidasIdentificadas,
  usuarios,
  Canton,
  articulo
};

