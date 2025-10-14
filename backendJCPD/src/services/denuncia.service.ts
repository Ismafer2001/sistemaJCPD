


import { Transaction } from "sequelize";
import sequelize from "../config/database";
import {
  Denuncia,
  Denunciante,
  Denunciado,
  Afectado,
  VulneracionesIdentificadas,
  medidasIdentificadas,
  Canton,
} from "../models";

export interface datosDenuncia {
  denuncia: Denuncia;
  denunciante?: Denunciante;
  denunciados?: Denunciado[];
  afectados?: Afectado[];
  vulneracion?: { id_afectado: number; vulneraciones: number[] }[];
  medida?: { id_afectado: number; medidas: number[] }[];
}


//---------------servicios globales de grupos prioritarios------------------//

export async function obtenertodasLasDenuncias({ page = 1, limit = 10, grupoPrioritario, id_canton }: { page?: number; limit?: number; grupoPrioritario: string; id_canton?: number }) {
  const offset = (page - 1) * limit;
  const where: any = {};
  if (grupoPrioritario) {
    where.grupoPrioritario = grupoPrioritario;
  }
  if (id_canton) {
    where.id_canton = id_canton;
  }
  const total = await Denuncia.count({ where });
  const denuncias = await Denuncia.findAll({
    where,
    include: [
      {
        model: Afectado,
        as: 'afectados',
        attributes: ['nombres', 'apellidos', 'cedula']
      }
    ],
    order: [['fechaCreado', 'DESC']],
    limit,
    offset
  });
  return {
    data: denuncias.map(denuncia => ({
      codigoTramite: denuncia.codigoTramite,
      fecha: denuncia.fechaCreado,
      id_canton: denuncia.id_canton,
      idDenuncia: denuncia.id,
      Afectado: denuncia.afectados?.map((a: any) => `${a.nombres} ${a.apellidos}`),
      cedulasAfectados: denuncia.afectados?.map((a: any) => a.cedula)
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}
//funciones para obtener tramite e incrementar automaticamente
export async function obtenerNumTramite({ incrementar = false } = {}, id_canton:number,grupoPrioritario:string) {
  const tramite = await Denuncia.findOne({
    where:{id_canton:id_canton,grupoPrioritario:grupoPrioritario},
    order: [["num_tramite", "DESC"]],
  });

  if (!tramite) return 0;


  return incrementar ? tramite.num_tramite + 1 : tramite.num_tramite;
}
//funcion para contar denuncias totales activas
export async function countDenuncias(id_canton:number, grupoPrioritario:string) {
  const denunciasActivas= await Denuncia.count({
    where: {
      estado: 'activa',
      id_canton: id_canton,
      grupoPrioritario: grupoPrioritario

    }
  });

  return denunciasActivas;
  
}

// Consulta una denuncia y devuelve el mismo formato que espera insertDenuncia
export async function getDenunciaCompleta(idDenuncia: number) {
  const denuncia = await Denuncia.findByPk(idDenuncia, {
    include: [
      { model: Denunciante, },
      { model: Denunciado,  },
      { model: Afectado, as: 'afectados' }
    ]
  });

  if (!denuncia) throw new Error('Denuncia no encontrada');

  // Formatear afectados (evitar acceso a null)
  const afectados = Array.isArray((denuncia as any).afectados)
    ? (denuncia as any).afectados.map((a: any) => ({ ...a.get() }))
    : [];

  // Obtener vulneraciones y medidas identificadas por separado
  const VulneracionesIdentificadas = await (await import('../models/vulneracionesidentificadas.models')).VulneracionesIdentificadas.findAll({
    where: { idAfectado: afectados.map((a: any) => a.id) }
  });
  const medidasIdentificadas = await (await import('../models/medidasIdentificada.models')).medidasIdentificadas.findAll({
    where: { idAfectado: afectados.map((a: any) => a.id) }
  });




  // Agrupar vulneraciones por afectado en formato { id, nombre, vulneracion: [desc1, desc2, ...] }
  const mapVuln = new Map();
  for (const v of VulneracionesIdentificadas) {
    const afectado = afectados.find((a: any) => a.id === v.idAfectado);
    const nombre = afectado ? `${afectado.nombres} ${afectado.apellidos}` : '';
    const id = afectado ? afectado.id : v.idAfectado;
    const vulnDesc = await (await import('../models/vulneraciones.models')).Vulneracion.findByPk(v.idVulneracion);
    if (!mapVuln.has(id)) mapVuln.set(id, { id, nombre, vulneracion: [] });
    if (vulnDesc) mapVuln.get(id).vulneracion.push(vulnDesc.vulneracion);
  }
  const vulneracion = Array.from(mapVuln.values());

  // Agrupar medidas por afectado en formato { id, nombre, medida: [desc1, desc2, ...] }
  const mapMed = new Map();
  for (const m of medidasIdentificadas) {
    const afectado = afectados.find((a: any) => a.id === m.idAfectado);
    const nombre = afectado ? `${afectado.nombres} ${afectado.apellidos}` : '';
    const id = afectado ? afectado.id : m.idAfectado;
    const medidaDesc = await (await import('../models/medidas_proteccion.models')).medida.findByPk(m.idMedida);
    if (!mapMed.has(id)) mapMed.set(id, { id, nombre, medida: [] });
    if (medidaDesc) mapMed.get(id).medida.push(medidaDesc.medidas);
  }
  const medida = Array.from(mapMed.values());

  // Extraer arrays de relaciones
  // Tipado explícito y solo alias Sequelize
  const denunciantes = Array.isArray((denuncia as any).Denunciantes)
    ? (denuncia as any).Denunciantes.map((d: any) => ({ ...d.get() }))
    : [];
  const denunciados = Array.isArray((denuncia as any).Denunciados)
    ? (denuncia as any).Denunciados.map((d: any) => ({ ...d.get() }))
    : [];

  return {
    denuncia: { ...denuncia.get() },
    afectados,
    denunciantes,
    denunciados,
    vulneracion,
    medida
  };
}


//-----------------------sercvicios denuncia nna-----------------------//
//servicio para insertar denuncia completa
export async function insertDenuncia(denunciajson: datosDenuncia) {
  const t: Transaction = await sequelize.transaction(); //iniciallizams transaccion

  try {
    const {
      denuncia,
      denunciante,
      denunciados = [],
      afectados = [],
      vulneracion = [],
      medida = [],
    } = denunciajson;


  

    const tramite = await Denuncia.findOne({
    where:{id_canton:denuncia.id_canton,grupoPrioritario:denuncia.grupoPrioritario},
    order: [["codigoTramite", "DESC"]],
  });

   if (!tramite){
     denuncia.num_tramite = denuncia.num_tramite ?? 1;
   } else {
     denuncia.num_tramite = tramite.num_tramite + 1;
   }

   // Obtener el nombre del cantón asociado y usarlo en el código de trámite
  const cantonRecord = await Canton.findByPk(denuncia.id_canton);
  const cantonName = cantonRecord ? cantonRecord.canton : `${denuncia.id_canton}`;
  const currentYear = new Date().getFullYear();
  denuncia.codigoTramite = `${denuncia.num_tramite}-JCPD-${cantonName}-${currentYear}-NIÑOS`;


    const nuevaDenuncia = await Denuncia.create({...denuncia, estatus:'completada', codigoTramite: denuncia.codigoTramite}, { transaction: t });//agremamos la denuncia a la base de datos

    // si revicimos datos del denunciante lo agregamos denunciantes a la base de datos 
    if (denunciante) {
      await Denunciante.create(
        //se crea la denunci acon todos los campos enviados desde el body
        { ...denunciante, idDenuncia: nuevaDenuncia.id,  },
        { transaction: t }
      );
    }

    //agregamos denunciados a la base de datos
    if (denunciados.length) { //verificamos que si denuciado contiene algo
      await Promise.all(
        denunciados.map((d: Denunciado) => //recorremos y creamos un nuevo array por cada denunciado obtenido del body
          Denunciado.create(
            { ...d, idDenuncia: nuevaDenuncia.id },
            { transaction: t }
          )
        )
      );
    }

    const idMap = new Map(); // guardará id temporal vs id real de los afectados

    //
    for (const [index, afectado] of afectados.entries()) { //recorremos el array afectados usando entries()
                                                           //para obtener un array clave:valor
      const nuevoAfectado = await Afectado.create(
        { ...afectado, idDenuncia: nuevaDenuncia.id },
        { transaction: t }
      );

      // Mapeo: posición como clave y como valor el id real del afectado
      idMap.set(index, nuevoAfectado.id);
    }

    // Asociar vulneraciones por id_afectado
    for (const v of vulneracion) {
      const realId = idMap.get(+v.id_afectado); // obtemos el id real del afectado 
      
      if (realId && v.vulneraciones.length) {
        const data = v.vulneraciones.map((id: number) => ({
          idAfectado: realId,
          idVulneracion: id,
        }));
        
        await VulneracionesIdentificadas.bulkCreate(data, { transaction: t });
      }
    }

    // Asociar medidas por id_afectado
    for (const m of medida) {
      const realId = idMap.get(+m.id_afectado);
      if (realId && m.medidas.length) {
        const data = m.medidas.map((id: number) => ({
          idAfectado: realId,
          idMedida: id,
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


export async function eliminarDenuncia(id:string) {
  const t: Transaction = await sequelize.transaction();

try {
  const idDenuncia = id; // el ID de la denuncia que quieres eliminar

  // 1. Obtener afectados de la denuncia
  const afectados = await Afectado.findAll({ where: { idDenuncia }, transaction: t });

  for (const afectado of afectados) {
    // 2. Eliminar medidas relacionadas con el afectado
    await medidasIdentificadas.destroy({
      where: { idAfectado: afectado.id },
      transaction: t,
    });

    // 3. Eliminar vulneraciones relacionadas con el afectado
    await VulneracionesIdentificadas.destroy({
      where: {idAfectado: afectado.id },
      transaction: t,
    });
  }

  // 4. Eliminar afectados
  await Afectado.destroy({ where: { idDenuncia }, transaction: t });

  // 5. Eliminar denunciados
  await Denunciado.destroy({ where: { idDenuncia }, transaction: t });

  // 6. Eliminar denunciante
  await Denunciante.destroy({ where: { idDenuncia }, transaction: t });

  // 7. Finalmente eliminar la denuncia
  await Denuncia.destroy({ where: { id: idDenuncia }, transaction: t });

  await t.commit();
  return { message: 'Denuncia y todas sus relaciones eliminadas con éxito' };
} catch (err) {
  await t.rollback();
  throw err;
}

  
}

// Servicio para actualizar denuncia completa
export async function actualizarDenuncia(idDenuncia: number, denunciajson: datosDenuncia) {
  const t: Transaction = await sequelize.transaction();
  try {
    // Actualizar datos principales de la denuncia
    await Denuncia.update(
      { ...denunciajson.denuncia },
      { where: { id: idDenuncia }, transaction: t }
    );

    // Actualizar denunciante
    if (denunciajson.denunciante) {
      await Denunciante.update(
        { ...denunciajson.denunciante },
        { where: { idDenuncia }, transaction: t }
      );
    }

    // Actualizar denunciados
    if (denunciajson.denunciados && denunciajson.denunciados.length) {
      // Eliminar denunciados actuales
      await Denunciado.destroy({ where: { idDenuncia }, transaction: t });
      // Insertar nuevos denunciados
      await Promise.all(
        denunciajson.denunciados.map((d: Denunciado) =>
          Denunciado.create({ ...d, idDenuncia }, { transaction: t })
        )
      );
    }

    // Actualizar afectados
    if (denunciajson.afectados && denunciajson.afectados.length) {
      // Eliminar afectados actuales
      await Afectado.destroy({ where: { idDenuncia }, transaction: t });
      // Insertar nuevos afectados
      const idMap = new Map();
      for (const [index, afectado] of denunciajson.afectados.entries()) {
        const nuevoAfectado = await Afectado.create({ ...afectado, idDenuncia }, { transaction: t });
        idMap.set(index, nuevoAfectado.id);
      }

      // Actualizar vulneraciones
      await VulneracionesIdentificadas.destroy({ where: { idAfectado: Array.from(idMap.values()) }, transaction: t });
      if (denunciajson.vulneracion) {
        for (const v of denunciajson.vulneracion) {
          const realId = idMap.get(+v.id_afectado);
          if (realId && v.vulneraciones.length) {
            const data = v.vulneraciones.map((id: number) => ({ idAfectado: realId, idVulneracion: id }));
            await VulneracionesIdentificadas.bulkCreate(data, { transaction: t });
          }
        }
      }

      // Actualizar medidas
      await medidasIdentificadas.destroy({ where: { idAfectado: Array.from(idMap.values()) }, transaction: t });
      if (denunciajson.medida) {
        for (const m of denunciajson.medida) {
          const realId = idMap.get(+m.id_afectado);
          if (realId && m.medidas.length) {
            const data = m.medidas.map((id: number) => ({ idAfectado: realId, idMedida: id }));
            await medidasIdentificadas.bulkCreate(data, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    return { ok: true, message: 'Denuncia actualizada correctamente' };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}


