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



export interface datosDenuncia {
  denuncia: Denuncia;
  denunciante?: Denunciante;
  denunciados?: Denunciado[];
  afectados?: Afectado[];
  vulneracion?: { id_afectado: number; vulneraciones: number[] }[];
medida?: { id_afectado: number; medidas: number[] }[];
 
}

export async function insertDenuncia(denunciajson: datosDenuncia) {
  const t: Transaction = await sequelize.transaction();

  try {
    const {
      denuncia,
      denunciante,
      denunciados = [],
      afectados = [],
      vulneracion = [],
      medida = [],
    } = denunciajson;

    const nuevaDenuncia = await Denuncia.create(denuncia, { transaction: t });

    if (denunciante) {
      await Denunciante.create(
        { ...denunciante, idDenuncia: nuevaDenuncia.id },
        { transaction: t }
      );
    }

    if (denunciados.length) {
      await Promise.all(
        denunciados.map((d:Denunciado) =>
          Denunciado.create(
            { ...d, idDenuncia: nuevaDenuncia.id },
            { transaction: t }
          )
        )
      );
    }

    const idMap = new Map(); // guardará id temporal vs id real

    for (const [index, afectado] of afectados.entries()) {
      const nuevoAfectado = await Afectado.create(
        { ...afectado, idDenuncia: nuevaDenuncia.id },
        { transaction: t }
      );

      // Mapeo: posición -> id real del afectado
      idMap.set(index + 1, nuevoAfectado.id);
    }

    // Asociar vulneraciones por id_afectado
    for (const v of vulneracion) {
      const realId = idMap.get(+v.id_afectado);
      if (realId && v.vulneraciones.length) {
        const data = v.vulneraciones.map((id:number) => ({
          afectado_id: realId,
          vulneracion_id: id,
        }));
        await VulneracionesIdentificadas.bulkCreate(data, { transaction: t });
      }
    }

    // Asociar medidas por id_afectado
    for (const m of medida) {
      const realId = idMap.get(+m.id_afectado);
      if (realId && m.medidas.length) {
        const data = m.medidas.map((id:number) => ({
          afectado_id: realId,
          medidas_id: id,
        }));
        await medidasIdentificadas.bulkCreate(data, { transaction: t });
      }
    }

    await t.commit();
    return nuevaDenuncia;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}


