
import {  Transaction, } from "sequelize";

import { Denuncia, Afectado, Denunciante, Denunciado, Vulneracion, Canton, Avocatoria, VulneracionesIdentificadas, medida, medidasIdentificadas, MedidasEmergentes, usuarios, Notificacion } from "../models";
import sequelize from "../config/database";
// Servicio para crear una avocatoria
export async function crearAvocatoria(data: Avocatoria) {
  const existeDenuncia = await Denuncia.findOne({ where: { id: data.idDenuncia } });
  if (!existeDenuncia) {
    const error = new Error("No hay una denuncia resgistrada ");
    error.name = "sinDenuncia";
    throw error;
  }
  const existe = await Avocatoria.findOne({ where: { idDenuncia: data.idDenuncia } });
  if (existe) {
    const error = new Error("Avocatoria ya existe");
    error.name = "AvocatoriaYaExiste";
    throw error;
  }
  const t: Transaction = await sequelize.transaction();
  try {
    // Crear la avocatoria
    const nuevaAvocatoria = await Avocatoria.create({
      
      codigoTramite: data.codigoTramite,
      horaActual: data.horaActual,
      disposiciones: data.disposiciones,
      articulo: data.articulo,
      idDenuncia: data.idDenuncia,
      estatus:  'completada',
    }, { transaction: t });

   

    await t.commit();
    return nuevaAvocatoria;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
//servicio para obtener datos de la denuncia que tendra relacion con la avocatoria
export async function obtenerDenunciaParaAvocatoria(idDenuncia: string) {
    const denuncia = await Denuncia.findByPk(idDenuncia, {
        attributes: [
            'id',
            'fechaCreado',
            'descripcion_hechos',
            'codigoTramite',
            'tipo_denuncia',
            'id_canton'
        ],
        include: [
            {
                model: Canton,
                attributes: ['canton'],
                as: 'canton'
            },
            {
                model: Afectado,
                as: 'afectados',
                attributes: ['nombres', 'apellidos', 'edad'],
                include: [
                    {
                        model: VulneracionesIdentificadas,
                        as:'vulneracionesI',
                        
                        attributes: ['idAfectado', 'idVulneracion'],
                        include:[
                            {
                                model: Vulneracion,
                                as: "vulneracion",
                                attributes:['vulneracion']

                            }
                        ]
                    }
                ]
            },
            {
                model: Denunciante,
                
                attributes: ['nombres', 'apellidos']
            },
            {
                model: Denunciado,
                
                attributes: ['nombres', 'apellidos']
            },
            {
              model: Avocatoria,
              as:'avocatoria',
              attributes: ['id'],
            }
        ]
    });
    if (!denuncia) {
        throw new Error("Denuncia no encontrada");
    }
  const result = {
    id: denuncia.id,
    fechaCreado: denuncia.fechaCreado,
    codigoTramite: denuncia.codigoTramite,
    canton: denuncia.canton?.canton || null,
    descripcion_hechos: denuncia.descripcion_hechos,
    afectados: (denuncia.afectados || []).map((af: any) => ({
      nombres: af.nombres,
      apellidos: af.apellidos,
      edad: af.edad,
      vulneraciones: (af.vulneracionesI || []).map((v: any) => ({
        id: v.id,
        vulneracion: v.vulneracion?.vulneracion
      }))
    })),
    denunciante: (denuncia.Denunciantes || []).map((d: any) => ({
      nombres: d.nombres,
      apellidos: d.apellidos
    })),
    denunciados: (denuncia.Denunciados || []).map((d: any) => ({
      nombres: d.nombres,
      apellidos: d.apellidos
    })),
  tipoDenuncia: denuncia.tipo_denuncia === 'oficio' ? 'oficio' : 'denuncia',
  idAvocatoria: denuncia.avocatoria?.id || null
  };
  return result;
}

//servicio para obtener datos completos de una avocatoria existente
export async function getAvocatoriaCompleta(idDenuncia: number) {
  const avocatoria = await Avocatoria.findOne({
    where:{idDenuncia:idDenuncia},
    include: [
      {
        model: Denuncia,
        as: "denunciaAvocatoria",
        include: [
          { model: Canton, as: 'canton', attributes: ['id', 'canton'] },
          {
            model: Afectado,
            as: 'afectados',
            attributes: ['id', 'nombres', 'apellidos', 'edad'],
            include: [
              {
                model: VulneracionesIdentificadas,
                as: 'vulneracionesI',
                attributes: ['id', 'idAfectado', 'idVulneracion']
              },
              {
                model: MedidasEmergentes,
                as: 'medidasE',
                attributes: ['id', 'idMedida', 'idAfectado', 'periodo', 'observaciones'],
                include: [
                  {
                    model: medida,
                    as: 'Med',
                    attributes: ['medidas']
                  }
                ]
              }
            ]
          },
          { model: Denunciante, attributes: ['nombres', 'apellidos'] },
          { model: Denunciado, attributes: ['nombres', 'apellidos'] }
        ]
      }
    ]
  });
  
  if (!avocatoria) throw new Error('Avocatoria no encontrada');

  const denuncia = avocatoria.denunciaAvocatoria;

  // Ejecutar queries en paralelo para mejor rendimiento
  const [usuariosPrincipales, vulneraciones] = await Promise.all([
    // Query de usuarios principales
    denuncia?.id_canton 
      ? usuarios.findAll({
          where: {
            id_canton: denuncia.id_canton,
            isactivo: true,
            rol: 'principal'
          },
          attributes: ['id', 'nombres', 'apellidos', 'rol']
        })
      : Promise.resolve([]),
    
    // Query de vulneraciones únicas
    (async () => {
      if (!denuncia?.afectados || denuncia.afectados.length === 0) return [];
      
      const idsVulneraciones = new Set<number>();
      denuncia.afectados.forEach((afectado: any) => {
        afectado.vulneracionesI?.forEach((vulnId: any) => {
          idsVulneraciones.add(vulnId.idVulneracion);
        });
      });

      return idsVulneraciones.size > 0
        ? Vulneracion.findAll({
            where: { id: Array.from(idsVulneraciones) },
            attributes: ['id', 'vulneracion']
          })
        : [];
    })()
  ]);

  // Crear mapa de vulneraciones para acceso rápido
  const vulneracionesMap = new Map();
  vulneraciones.forEach((vuln: any) => {
    vulneracionesMap.set(vuln.id, vuln);
  });

  // Procesar medidas emergentes y vulneraciones por afectado
  const medidasEmergentes: any[] = [];
  const vulneracionesPorAfectado: any = {};

  denuncia?.afectados?.forEach((afectado: any) => {
    // Procesar medidas emergentes
    afectado.medidasE?.forEach((medida: any) => {
      medidasEmergentes.push({
        id: medida.id,
        idMedida: medida.idMedida,
        medida: medida.Med?.medidas || '',
        idAfectado: medida.idAfectado,
        periodo: medida.periodo,
        observaciones: medida.observaciones
      });
    });

    // Procesar vulneraciones
    const vulneracionesAfectado: any[] = [];
    afectado.vulneracionesI?.forEach((vulnId: any) => {
      const vulneracion = vulneracionesMap.get(vulnId.idVulneracion);
      if (vulneracion) {
        vulneracionesAfectado.push({
          id: vulnId.id,
          idVulneracion: vulneracion.id,
          nombreVulneracion: vulneracion.vulneracion
        });
      }
    });
    vulneracionesPorAfectado[afectado.id] = vulneracionesAfectado;
  });

  
 
      
  return {
    id: avocatoria.id,
    codigoTramite: avocatoria.codigoTramite,
    disposiciones: avocatoria.disposiciones,
    articulo: avocatoria.articulo,
    estatus: avocatoria.estatus,
    fechaCreado: avocatoria.fechaCreado,
    denuncia: denuncia ? {
      id: denuncia.id,
      fechaCreado: denuncia.fechaCreado,
      codigoTramite: denuncia.codigoTramite,
      canton: denuncia.canton?.canton || null,
      descripcion_hechos: denuncia.descripcion_hechos,
      tipoDenuncia: denuncia.tipo_denuncia === 'oficio' ? 'oficio' : 'externa',
      afectados: (denuncia.afectados || []).map((af: any) => ({
        id: af.id,
        nombres: af.nombres,
        apellidos: af.apellidos,
        edad: af.edad,
        vulneraciones: vulneracionesPorAfectado[af.id] || []
      })),
      denunciante: (denuncia.Denunciantes || []).map((d: any) => ({
        nombres: d.nombres,
        apellidos: d.apellidos
      })),
      denunciados: (denuncia.Denunciados || []).map((d: any) => ({
        nombres: d.nombres,
        apellidos: d.apellidos
      }))
    } : null,
    medidasEmergentes,
    usuariosPrincipales,
    notificacion: (denuncia?.Notificacions && denuncia.Notificacions.length > 0) ? denuncia.Notificacions[0].id : null
  };
}
//servicio para obtener los afectados de una denuncia seleccionada
export async function obtenerAfectados(idDenuncia: number) { //---> se repite en audiencia de pruebas

  return await Afectado.findAll({
    where: { idDenuncia: idDenuncia },
    attributes: ['id', 'nombres'],
  });
};

//servicio para obtener las medidas identificadas en la fase de denuncia de un afectado seleccionado    
export const medidasPorAfectado = async (idAfectado: number) => {
  const afectado = await Afectado.findByPk(idAfectado, {
    attributes: ['id', 'nombres'],
    include: [
      {
        model: medidasIdentificadas,
        as: "medidasI",
        attributes: ['idMedida'],
        include: [
          {
            model: medida,
            as: 'medidas', // ← importante: debe coincidir con el modelo
            attributes: ['medidas'],
          },
        ],
      },
    ],
  });

  if (!afectado) return [];

  const resultadoFormateado = [];

  for (const mi of afectado.medidasI || []) {
   
    if (mi.medidas?.medidas) {
      resultadoFormateado.push({
        idMedida: mi.idMedida,
        idAfectado: afectado.id,
        nombres: afectado.nombres,
        medida: mi.medidas.medidas
      });
    }
  }
  
  return resultadoFormateado;
};



//servicio para editar una avocatoria existente
export async function editarAvocatoria(idDenuncia: number, data: {
  codigoTramite: string;
  horaActual: string;
  dispocisiones: string;
  articulo: string;
  idDenuncia: number;
  estatus: "pendiente"|"en_proceso"|"completada";
  mediasEmergentes: Array<{
    idAfectado: number;
    idMedida: number;
    medida: string;
    periodo: string;
    observaciones: string;
  }>;
}) {
  const t: Transaction = await sequelize.transaction();
  try {
    // Actualizar la avocatoria
    const avocatoria = await Avocatoria.findOne({where:{idDenuncia:idDenuncia}});
    if (!avocatoria) throw new Error('Avocatoria no encontrada');
    await avocatoria.update({
      codigoTramite: data.codigoTramite,
      horaActual: data.horaActual,
      disposiciones: data.dispocisiones,
      articulo: data.articulo,
      idDenuncia: data.idDenuncia,
      estatus: data.estatus
    }, { transaction: t });


    await t.commit();
    return await getAvocatoriaCompleta(idDenuncia);
  } catch (error) {
    await t.rollback();
    throw error;
  }
}





