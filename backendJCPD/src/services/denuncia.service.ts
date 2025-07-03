import { Transaction } from "sequelize";
import sequelize from '../config/database';
import {
  Denuncia,
  Denunciante,
  Denunciado,
  Afectado,
  
  VulneracionesIdentificadas,
  medidasIdentificadas,
  
} from '../models';
interface AfectadoExtendido extends Afectado {
  vulneraciones?: number[];
  medidas?: number[];
}


export interface datosDenuncia {
  denuncia: Denuncia;
  denunciante?: Denunciante;
  denunciados?: Denunciado[];
  afectados?: AfectadoExtendido[];
 
}

export async function insertDenuncia(denunciajson: datosDenuncia) {
  const t: Transaction = await sequelize.transaction();

  try {
    const {
      denuncia,
      denunciante,
      denunciados = [],
      afectados = [],
    } = denunciajson;

    // 1. Crear la denuncia principal
    const nuevaDenuncia = await Denuncia.create(denuncia, { transaction: t });

    // 2. Crear denunciante
    if (denunciante) {
      await Denunciante.create(
        { ...denunciante, idDenuncia: nuevaDenuncia.id },
        { transaction: t }
      );
    }

    // 3. Crear denunciados
    if (denunciados.length) {
      await Promise.all(
        denunciados.map((d) =>
          Denunciado.create(
            { ...d, idDenuncia: nuevaDenuncia.id },
            { transaction: t }
          )
        )
      );
    }

    // 4. Crear afectados con sus vulneraciones y medidas
    for (const afectado of afectados) {
      const { vulneraciones = [], medidas = [], ...datosAfectado } = afectado;

      const nuevoAfectado = await Afectado.create(
        { ...datosAfectado, idDenuncia: nuevaDenuncia.id },
        { transaction: t }
      );

      // Vulneraciones
      if (vulneraciones.length) {
        const relacionesVul = vulneraciones.map((vulId) => ({
          afectado_id: nuevoAfectado.id,
          vulneracion_id: vulId,
        }));
        await VulneracionesIdentificadas.bulkCreate(relacionesVul, {
          transaction: t,
        });
      }

      // Medidas
      if (medidas.length) {
        const relacionesMedidas = medidas.map((medId) => ({
          afectado_id: nuevoAfectado.id,
          medidas_id: medId,
        }));
        await medidasIdentificadas.bulkCreate(relacionesMedidas, {
          transaction: t,
        });
      }
    }

    await t.commit();
    return nuevaDenuncia;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

