import {  Transaction, } from "sequelize";
import { avocatoriaDTO } from "../interfaces/avocatoria.interface";
import { Denuncia, Afectado, Denunciante, Denunciado, Vulneracion, Canton, Avocatoria, VulneracionesIdentificadas, medida, medidasIdentificadas, MedidasEmergentes } from "../models";
import sequelize from "../config/database";
// Servicio para crear una avocatoria
export async function crearAvocatoria(data: {
  fechaActual: string;
  codigoTramite: string;
  horaActual: string;
  dispocisiones: string;
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
    throw new Error("avocatoria ya existe");
  }
  const t: Transaction = await sequelize.transaction();
  try {
    // Crear la avocatoria
    const nuevaAvocatoria = await Avocatoria.create({
      
      codigoTramite: data.codigoTramite,
      horaCreado: data.horaActual,
      disposiciones: data.dispocisiones,
      idDenuncia: data.idDenuncia,
      estatus:  'completada',
    }, { transaction: t });

    // Crear medidas emergentes asociadas en la tabla medidas_emergentes
    for (const medida of data.mediasEmergentes) {
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

export async function obtenerDenunciaParaAvocatoria(id: string) {
    const denuncia = await Denuncia.findByPk(id, {
        attributes: [
            'id',
            'fechaCreado',
            'descripcion_hechos',
            'codigoTramite'
        ],
        include: [
            {
                model: Canton,
                attributes: ['canton'],
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
    return denuncia;
}

export async function obtenerAfectados(id: number) {
    console.log("ID en el servicio:", id);
      return await Afectado.findAll({where:{idDenuncia:id},
    attributes: ['id', 'nombres'],
  });
};

    
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
    console.log("Medidaaaaas aquii identificada:", mi.idMedida);
    if (mi.medidas?.medidas) {
      resultadoFormateado.push({
        idMedida: mi.idMedida,
        idafectado: afectado.id,
        nombres: afectado.nombres,
        medida: mi.medidas.medidas
      });
    }
  }

  return resultadoFormateado;
};


