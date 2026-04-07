import { usuarios } from "./usuarios.models";
import { Canton } from "./cantones.models";
import { Afectado } from "./afectado.models";
import { Denuncia } from "./denuncia.models";
import { Denunciado } from "./denunciado.models";
import { Denunciante } from "./denunciante.models";
import { Vulneracion } from "./vulneraciones.models";
import { VulneracionesIdentificadas } from "./vulneracionesidentificadas.models";
import { medida } from "./medidas_proteccion.models";
import { medidasIdentificadas } from "./medidasIdentificada.models";
import { articulo } from "./articulo_medidas.models";
import { Avocatoria } from "./avocatoria.model";
import { MedidasEmergentes } from "./medidas_emergentes.model";
import { Notificacion } from "./notificacion.model";
import { Otros } from "./Otros.models";
import { Citacion } from "./citaciones.model";
import { AudienciaContestacion } from "./audiencia_constestacion.model";
import { ParticipantesAudienciaContestacion } from "./participantes_audiencia.model";
import { AudienciaPruebas } from "./audiencia_prueba.model";
import { ParticipantesAudienciaPruebas } from "./participantes_audiencia_pruebas.model";
import { Resoluciones } from "./resoluciones.models";
import { MedidasDefinitivas } from "./medidasDefinitivas.models";
import { Testimonio } from "./testimonios.models";
import { CumpleMedidas } from "./cumpleMedidas.models";
import { InformeAnexado } from "./informeAnexado.models";
import { CierreCaso } from "./cierreCaso.models";
import { InformesPresentados } from "./informes_presentados.models";
import { ControlImpugnacion } from "./controlImpugnacion.model";
import { DenunciaMujeres } from "./denunciaMujeres.model";
import { Providencias } from "./providencia.model";
import { Desestimiento } from "./desestimiento.models";
import { Informe } from "./informe.models";

import { Expediente } from "./expedientes.models";
import { Deprecatoria } from "./deprecatoria.models";
// Relación Denuncia - Expediente (uno a muchos)
Denuncia.hasMany(Expediente, { foreignKey: "idDenuncia", as: "expedientes" });
Expediente.belongsTo(Denuncia, { foreignKey: "idDenuncia" });

//relacion usuario -- canton
usuarios.belongsTo(Canton, { foreignKey: "id_canton" });
Canton.hasMany(usuarios, { foreignKey: "id_canton" });

//relacion denuncia  -- canton
Denuncia.belongsTo(Canton, { foreignKey: "id_canton", as: "canton" });
Canton.hasMany(Denuncia, { foreignKey: "id_canton" });
//relacion denuncia mujeres y denuncia
DenunciaMujeres.belongsTo(Denuncia, { foreignKey: "idDenuncia" });
Denuncia.hasOne(DenunciaMujeres, { foreignKey: "idDenuncia", as: "DM" });

//relacion providencia y denuncia
Providencias.belongsTo(Denuncia, { foreignKey: "idDenuncia", as: "denunciaP" });
Denuncia.hasOne(Providencias, { foreignKey: "idDenuncia", as: "providencia" });

//relacion afectado denuncia
Denuncia.hasMany(Afectado, { foreignKey: "idDenuncia", as: "afectados" });
Afectado.belongsTo(Denuncia, { foreignKey: "idDenuncia" });

//relacion denunciado denuncia
Denuncia.hasMany(Denunciado, { foreignKey: "idDenuncia" });
Denunciado.belongsTo(Denuncia, { foreignKey: "idDenuncia" });

//relacion denunciante denuncia
Denuncia.hasMany(Denunciante, { foreignKey: "idDenuncia" });
Denunciante.belongsTo(Denuncia, { foreignKey: "idDenuncia" });

// Relación uno a muchos entre afectado y Vulneracionensidentificadas

Afectado.hasMany(VulneracionesIdentificadas, {
  foreignKey: "idAfectado",
  as: "vulneracionesI",
});
VulneracionesIdentificadas.belongsTo(Afectado, { foreignKey: "idAfectado" });

// Relación uno a muchos entre vulneracion y Vulneracionensidentificadas
Vulneracion.hasMany(VulneracionesIdentificadas, {
  foreignKey: "idVulneracion",
  as: "vulneracionesI",
});
VulneracionesIdentificadas.belongsTo(Vulneracion, {
  foreignKey: "idVulneracion", as: "vulneracion",
});

// Relación uno a muchos entre afectado y medidasidentificadas
Afectado.hasMany(medidasIdentificadas, {
  foreignKey: "idAfectado",
  as: "medidasI",
});
medidasIdentificadas.belongsTo(Afectado, { foreignKey: "idAfectado" });

// Relación uno a muchos entre medidas y medidasidentificadas
medida.hasMany(medidasIdentificadas, {
  foreignKey: "idMedida",
  as: "medidasI",
});
medidasIdentificadas.belongsTo(medida, {
  foreignKey: "idMedida",
  as: "medidas",
});

// Relación entre medida y articulo
medida.belongsTo(articulo, {
  foreignKey: "idArticulo",
});

articulo.hasMany(medida, {
  foreignKey: "idArticulo",
});

// Relación: Una denuncia puede tener una avocatorias
Avocatoria.belongsTo(Denuncia, { foreignKey: "idDenuncia", as: "denunciaAvocatoria" });
Denuncia.hasOne(Avocatoria, { foreignKey: "idDenuncia", as:'avocatoria' });



// Relación uno a muchos entre medida y medidasemergentes
medida.hasMany(MedidasEmergentes, { foreignKey: "idMedida", as: "medidasE" });
MedidasEmergentes.belongsTo(medida, { foreignKey: "idMedida", as: "Med" });

// Relación uno a muchos: un afectado puede tener muchas medidas emergentes
Afectado.hasMany(MedidasEmergentes, {
  foreignKey: "idAfectado",
  as: "medidasE",
});
MedidasEmergentes.belongsTo(Afectado, { foreignKey: "idAfectado" });

// Relación: Una denuncia puede tener muchas notificaciones
Notificacion.belongsTo(Denuncia, { foreignKey: "idDenuncia" });
Denuncia.hasMany(Notificacion, { foreignKey: "idDenuncia" });

// Relación uno a muchos notificacion --->otroNotificados
Otros.belongsTo(Denuncia, {
  foreignKey: "idDenuncia",
});

Denuncia.hasMany(Otros, {
  foreignKey: "idDenuncia",
  as: "otros",
});

//relacion citacion y denuncia
Citacion.belongsTo(Denuncia, { foreignKey: "idDenuncia" });
Denuncia.hasMany(Citacion, { foreignKey: "idDenuncia" });

//relacion audiencia contestacion y denuncia
AudienciaContestacion.belongsTo(Denuncia, { foreignKey: "idDenuncia" });
Denuncia.hasOne(AudienciaContestacion, { foreignKey: "idDenuncia", as: "ac" });


//relacion audiencia contestacion y participantes audiencia
ParticipantesAudienciaContestacion.belongsTo(AudienciaContestacion, {
  foreignKey: "idAC", as: "PAC",
});
AudienciaContestacion.hasMany(ParticipantesAudienciaContestacion, {
  foreignKey: "idAC", as: "PAC",
});

//realacion audiencia pruebas y denuncia
AudienciaPruebas.belongsTo(Denuncia, { foreignKey: "idDenuncia" });
Denuncia.hasOne(AudienciaPruebas, { foreignKey: "idDenuncia", as:"ap" });

//realacion audiencia pruebas y participantes audiencia pruebas
ParticipantesAudienciaPruebas.belongsTo(AudienciaPruebas, {
  foreignKey: "idAP", as: "PAC",
});
AudienciaPruebas.hasMany(ParticipantesAudienciaPruebas, {
  foreignKey: "idAP", as: "PAC",
});



// Relación uno a muchos entre medida y medidasdefinitivas
medida.hasMany(MedidasDefinitivas, { foreignKey: "idMedida", as: "medidasD" });
MedidasDefinitivas.belongsTo(medida, { foreignKey: "idMedida", as: "MedidasD" });
// Relación uno a muchos: un afectado puede tener muchas medidas definitivas
Afectado.hasMany(MedidasDefinitivas, {
  foreignKey: "idAfectado",
  as: "medidasD",
});
MedidasDefinitivas.belongsTo(Afectado, { foreignKey: "idAfectado" });
 
Testimonio.belongsTo(ParticipantesAudienciaPruebas, {
  foreignKey: "idAP", as: "TAP",
});
ParticipantesAudienciaPruebas.hasMany(Testimonio, {
  foreignKey: "idAP", as: "TAP",
});

Resoluciones.belongsTo(Denuncia, { foreignKey: "idDenuncia" });
Denuncia.hasOne(Resoluciones, { foreignKey: "idDenuncia", as: "resoluciones" });

// Relación uno a muchos entre medida y cumplimiento de medidas
medida.hasMany(CumpleMedidas, { foreignKey: "idMedida", as: "cumpleM" });
CumpleMedidas.belongsTo(medida, { foreignKey: "idMedida", as: "CumpleM" });

Afectado.hasMany(CumpleMedidas, {
  foreignKey: "idAfectado",
  as: "cumpleM",
});
CumpleMedidas.belongsTo(Afectado, { foreignKey: "idAfectado", });

InformeAnexado.hasMany(CumpleMedidas, {
  foreignKey: "idPath",
  as: "cumpleM",
});
CumpleMedidas.belongsTo(InformeAnexado, { foreignKey: "idPath", as: "InformeAnexado" });

//relacion cierre caso -- denuncia
CierreCaso.belongsTo(Denuncia, { foreignKey: "idDenuncia", as: "DenunciaCierre" });
Denuncia.hasOne(CierreCaso, { foreignKey: "idDenuncia", as: "CierreCaso" });

//relacion informes presentados -- cierre caso
InformesPresentados.belongsTo(CierreCaso, { foreignKey: "idCierraCaso", as: "CierreCaso" });
CierreCaso.hasMany(InformesPresentados, { foreignKey: "idCierraCaso", as: "informesPresentados" });

//relacion control impugnacion -- resoluciones
ControlImpugnacion.belongsTo(Resoluciones, { foreignKey: "idResolucion", as: "Resolucion" });
Resoluciones.hasOne(ControlImpugnacion, { foreignKey: "idResolucion", as: "ControlImpugnaciones" });

//relacion desestimiento -- denuncia
Desestimiento.belongsTo(Denuncia, { foreignKey: "idDenuncia", as: "DenunciaDes" });
Denuncia.hasOne(Desestimiento, { foreignKey: "idDenuncia", as: "Desestimiento" });

//relacion informe -- denuncia
Informe.belongsTo(Denuncia, { foreignKey: "idDenuncia", as: "DenunciaInforme" });
Denuncia.hasMany(Informe, { foreignKey: "idDenuncia", as: "informes" });

//relacion deprecatoria -- denuncia
Deprecatoria.belongsTo(Denuncia, { foreignKey: "idDenuncia", as: "DenunciaDeprecatoria" });
Denuncia.hasOne(Deprecatoria, { foreignKey: "idDenuncia", as: "deprecatoria" });

//relacion deprecatoria -- canton origen
Deprecatoria.belongsTo(Canton, { foreignKey: "idCantonOrigen", as: "cantonOrigen" });
Canton.hasMany(Deprecatoria, { foreignKey: "idCantonOrigen", as: "deprecatoriasOrigen" });

//relacion deprecatoria -- canton destino
Deprecatoria.belongsTo(Canton, { foreignKey: "idCantonDestino", as: "cantonDestino" });
Canton.hasMany(Deprecatoria, { foreignKey: "idCantonDestino", as: "deprecatoriasDestino" });



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
  AudienciaContestacion,
  AudienciaPruebas,
  ParticipantesAudienciaContestacion,
  ParticipantesAudienciaPruebas,
  Resoluciones,
  Citacion,
  MedidasDefinitivas,
  Otros,
  Testimonio,
  CumpleMedidas,
  InformeAnexado,
  CierreCaso,
  InformesPresentados,
  ControlImpugnacion,
  Desestimiento,
  Informe,
  Deprecatoria

};
