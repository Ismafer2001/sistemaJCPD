
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
import { Avocatoria } from './avocatoria.model';
import { MedidasEmergentes } from './medidas_emergentes.model';
import { Notificacion } from './notificacion.model';

import { Otros } from './Otros_notificados.models';

//relacion usuario -- canton
usuarios.belongsTo(Canton, { foreignKey: 'id_canton' });
Canton.hasMany(usuarios, { foreignKey: 'id_canton' });

//relacion denuncia  -- canton
Denuncia.belongsTo(Canton, { foreignKey: 'id_canton' });
Canton.hasMany(Denuncia, { foreignKey: 'id_canton' });

//relacion afectado denuncia
Denuncia.hasMany(Afectado, { foreignKey: 'idDenuncia', as:'afectados'});
Afectado.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });

//relacion denunciado denuncia
Denuncia.hasMany(Denunciado, { foreignKey: 'idDenuncia'});
Denunciado.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });

//relacion denunciante denuncia
Denuncia.hasMany(Denunciante, { foreignKey: 'idDenuncia' });
Denunciante.belongsTo(Denuncia, { foreignKey: 'idDenuncia' });

// Relación uno a muchos entre afectado y Vulneracionensidentificadas

Afectado.hasMany(VulneracionesIdentificadas,{foreignKey: 'idAfectado', as:'vulneracionesI'});
VulneracionesIdentificadas.belongsTo(Afectado,{foreignKey:'idAfectado'})

// Relación uno a muchos entre vulneracion y Vulneracionensidentificadas
Vulneracion.hasMany(VulneracionesIdentificadas,{foreignKey: 'idVulneracion', as:'vulneracionesI'});
VulneracionesIdentificadas.belongsTo(Vulneracion,{foreignKey:'idVulneracion'})

// Relación muchos a muchos entre afectados y medidas

// Relación uno a muchos entre afectado y medidasidentificadas
Afectado.hasMany(medidasIdentificadas,{foreignKey: 'idAfectado', as:'medidasI'});
VulneracionesIdentificadas.belongsTo(Afectado,{foreignKey:'idAfectado'})

// Relación uno a muchos entre medidas y medidasidentificadas
medida.hasMany(medidasIdentificadas,{foreignKey: 'idMedida', as:'medidasI'});
VulneracionesIdentificadas.belongsTo(medida,{foreignKey:'idMedida'})



// Relación entre medida y articulo
medida.belongsTo(articulo, {
  foreignKey: 'idArticulo'
});

articulo.hasMany(medida, {
  foreignKey: 'idArticulo'
});

// Relación: Una denuncia puede tener muchas avocatorias
Avocatoria.belongsTo(Denuncia, { foreignKey: 'idDenuncia'});
Denuncia.hasMany(Avocatoria, { foreignKey: 'idDenuncia' });



// Relación uno a muchos entre avocatoria y medidasemergentes
Avocatoria.hasMany(MedidasEmergentes,{foreignKey: 'idAvocatoria', as:'medidasE'});
MedidasEmergentes.belongsTo(Avocatoria,{foreignKey:'idAvocatoria'})

// Relación uno a muchos entre medida y medidasemergentes
medida.hasMany(MedidasEmergentes,{foreignKey: 'idMedida', as:'medidasE'});
MedidasEmergentes.belongsTo(medida,{foreignKey:'idMedida'})




// Relación uno a muchos: un afectado puede tener muchas medidas emergentes
Afectado.hasMany(MedidasEmergentes, { foreignKey: 'idAfectado', as: 'medidasE' });
MedidasEmergentes.belongsTo(Afectado, { foreignKey: 'idAfectado' });

// Relación: Una denuncia puede tener muchas notificaciones
Notificacion.belongsTo(Denuncia, { foreignKey: 'idDenuncia'});
Denuncia.hasMany(Notificacion, { foreignKey: 'idDenuncia' });

// Denuncia y Notificacion tienen relación muchos a muchos por Notificar



// Relación uno a muchos notificacion --->otroNotificados
Otros.belongsTo(Denuncia, {
  foreignKey: 'idDenuncia'
});

Denuncia.hasMany(Otros, {
  foreignKey: 'idDenuncia',
  as:'otros'
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
  articulo,
  Avocatoria,
  MedidasEmergentes,
  Notificacion,
  
  Otros
};

