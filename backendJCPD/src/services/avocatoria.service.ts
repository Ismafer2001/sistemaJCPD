
import {  Transaction, } from "sequelize";
import { avocatoriaDTO } from "../interfaces/avocatoria.interface";
import { Denuncia, Afectado, Denunciante, Denunciado, Vulneracion, Canton, Avocatoria, VulneracionesIdentificadas, medida, medidasIdentificadas, MedidasEmergentes, usuarios } from "../models";
import sequelize from "../config/database";
// Servicio para crear una avocatoria
export async function crearAvocatoria(data: {
  fechaActual: string;
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
      horaCreado: data.horaActual,
      disposiciones: data.dispocisiones,
      articulo: data.articulo,
      idDenuncia: data.idDenuncia,
      estatus:  'completada',
    }, { transaction: t });

    // Crear medidas emergentes asociadas en la tabla medidas_emergentes
    for (const medida of data.mediasEmergentes) {
      console.log("Medida emergente a crear:", data);
      if (!medida || medida.idMedida == null || medida.idAfectado == null) {
    // Puedes lanzar un error o simplemente continuar
    throw new Error("Medida emergente inválida: falta idMedida o idAfectado");
  }
      await MedidasEmergentes.create({
        idMedida: medida.idMedida,
        idAfectado: medida.idAfectado,
        idAvocatoria: nuevaAvocatoria.id ,
        periodo: medida.periodo,
        observaciones: medida.observaciones,
        // Cambia este campo si tu modelo usa otro nombre
      }, { transaction: t });
    }

    await t.commit();
    return nuevaAvocatoria;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
//servicio para obtener datos de la denuncia que tendra relacion con la avocatoria
export async function obtenerDenunciaParaAvocatoria(id: string) {
    const denuncia = await Denuncia.findByPk(id, {
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
  tipoDenuncia: denuncia.tipo_denuncia === 'oficio' ? 'oficio' : 'denuncia'
  };
  return result;
}

//servicio para obtener datos completos de una avocatoria existente
export async function getAvocatoriaCompleta(idAvocatoria: number) {
  const avocatoria = await Avocatoria.findByPk(idAvocatoria, {
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
                attributes: ['id', 'idAfectado', 'idVulneracion'],
                include: [
                  {
                    model: Vulneracion,
                    as: "vulneracion",
                    attributes: ['id', 'vulneracion']
                  }
                ]
              }
            ]
          },
          { model: Denunciante, attributes: ['nombres', 'apellidos'] },
          { model: Denunciado, attributes: ['nombres', 'apellidos'] }
        ]
      },
      {
        model: MedidasEmergentes,
        as: 'medidasE',
        attributes: ['id', 'idMedida', 'idAfectado', 'periodo', 'observaciones'],
        include: [
          {
            model: medida,
            as:'Med',
            attributes: ['medidas']
          }
        ]
      }
    ]
  });
  if (!avocatoria) throw new Error('Avocatoria no encontrada');

  // Usuarios principales activos del canton
  let usuariosPrincipales: any[] = [];
  if (avocatoria.denunciaAvocatoria?.id_canton) {

    usuariosPrincipales = await usuarios.findAll({
      where: {
        id_canton: avocatoria.denunciaAvocatoria.id_canton,
        isactivo: true,
        rol: 'principal'
      },
      attributes: ['id', 'nombres', 'apellidos', 'rol']
    });
  }

  const denuncia = avocatoria.denunciaAvocatoria;
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
      tipoDenuncia: denuncia.tipo_denuncia === 'oficio' ? 'oficio' : 'denuncia',
      afectados: (denuncia.afectados || []).map((af: any) => ({
        id: af.id,
        nombres: af.nombres,
        apellidos: af.apellidos,
        edad: af.edad,
        vulneraciones: (af.vulneracionesI || []).map((v: any) => ({
          id: v.id,
          idVulneracion: v.idVulneracion,
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
      }))
    } : null,
    medidasEmergentes: (avocatoria.medidasE || []).map((m: any) => ({
      id: m.id,
      idMedida: m.idMedida,
      medida: m.medida?.medidas || '',
      idAfectado: m.idAfectado,
      periodo: m.periodo,
      observaciones: m.observaciones
    })),
    usuariosPrincipales
  };
}
//servicio para obtener los afectados de una denuncia seleccionada
export async function obtenerAfectados(id: number) { //---> se repite en audiencia de pruebas

  return await Afectado.findAll({
    where: { idDenuncia: id },
    attributes: ['id', 'nombres'],
  });
};

//servicio para obtener las medidas identificadas en la fase de denuncia de un afectado seleccionado    
export const medidasPorAfectado = async (afectadoId: number) => {
  const afectado = await Afectado.findByPk(afectadoId, {
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
  console.log("Medidas identificadas:", resultadoFormateado);
  return resultadoFormateado;
};

//servicio para editar una avocatoria existente
export async function editarAvocatoria(idAvocatoria: number, data: {
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
    const avocatoria = await Avocatoria.findByPk(idAvocatoria);
    if (!avocatoria) throw new Error('Avocatoria no encontrada');
    await avocatoria.update({
      codigoTramite: data.codigoTramite,
      horaCreado: data.horaActual,
      disposiciones: data.dispocisiones,
      articulo: data.articulo,
      idDenuncia: data.idDenuncia,
      estatus: data.estatus
    }, { transaction: t });

    // Eliminar medidas emergentes anteriores
    await MedidasEmergentes.destroy({ where: { idAvocatoria: idAvocatoria }, transaction: t });

    // Crear nuevas medidas emergentes
    for(const medida of data.mediasEmergentes) {
      await MedidasEmergentes.create({
        idMedida: medida.idMedida,
        idAfectado: medida.idAfectado,
        idAvocatoria: idAvocatoria,
        periodo: medida.periodo,
        observaciones: medida.observaciones
      }, { transaction: t });
    }

    await t.commit();
    return await getAvocatoriaCompleta(idAvocatoria);
  } catch (error) {
    await t.rollback();
    throw error;
  }
}





