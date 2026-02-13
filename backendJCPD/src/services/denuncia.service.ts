import { Transaction, Op } from "sequelize";
import sequelize from "../config/database";
import {
  Denuncia,
  Denunciante,
  Denunciado,
  Afectado,
  VulneracionesIdentificadas,
  medidasIdentificadas,
  Canton,
  Avocatoria,
} from "../models";
import { DenunciaMujeres } from "../models/denunciaMujeres.model";

export interface datosDenuncia {
  denuncia: Denuncia;
  denunciante?: Denunciante;
  denunciados?: Denunciado[];
  afectados?: Afectado[];
  vulneraciones?: { idAfectado: number; vulneraciones: number[] }[];
  medidas?: { idAfectado: number; medidas: number[] }[];
  
}


//---------------servicios globales de grupos prioritarios------------------//

export async function obtenertodasLasDenuncias({ 
  page = 1, 
  limit = 10, 
  grupoPrioritario, 
  id_canton,
  search, // Valor a buscar
  searchBy // Tipo de búsqueda: 'codigoTramite', 'nombre', 'cedula'
}: { 
  page?: number; 
  limit?: number; 
  grupoPrioritario: string; 
  id_canton?: number;
  search?: string; // Valor a buscar
  searchBy?: 'codigoTramite' | 'nombre' | 'cedula'; // Tipo de búsqueda
}) {
  const offset = (page - 1) * limit;
  const where: any = {};
  
  // Filtros base
  if (grupoPrioritario) {
    where.grupoPrioritario = grupoPrioritario;
  }
  if (id_canton) {
    where.id_canton = id_canton;
  }

  // Búsqueda específica según el tipo seleccionado
  if (search && searchBy) {
    switch (searchBy) {
      case 'codigoTramite':
        where.codigoTramite = { [Op.iLike]: `%${search}%` };
        break;
      case 'cedula':
        where.id = {
          [Op.in]: sequelize.literal(`(
            SELECT DISTINCT "idDenuncia" 
            FROM afectado 
            WHERE cedula ILIKE '%${search.replace(/'/g, "''")}%'
          )`)
        };
        break;
      case 'nombre':
        where.id = {
          [Op.in]: sequelize.literal(`(
            SELECT DISTINCT "idDenuncia" 
            FROM afectado 
            WHERE nombres ILIKE '%${search.replace(/'/g, "''")}%'
               OR apellidos ILIKE '%${search.replace(/'/g, "''")}%'
          )`)
        };
        break;
    }
  }

  // Configurar includes
  const includeAfectados = {
    model: Afectado,
    as: 'afectados',
    attributes: ['nombres', 'apellidos', 'cedula'],
    required: false
  };

  // Conteo simple
  const total = await Denuncia.count({ where });

  // Consulta principal
  const denuncias = await Denuncia.findAll({
    where,
    include: [includeAfectados],
    order: [['fechaCreado', 'DESC']],
    limit,
    offset
  });

  return {
    data: denuncias.map(denuncia => ({
      codigoTramite: denuncia.codigoTramite,
      estado: denuncia.estado,
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
      { model: Denunciante },
      { model: Denunciado },
      { model: Afectado, as: 'afectados' },
      { model: Avocatoria, as: 'avocatoria' },
      { model: DenunciaMujeres, as: 'DM', required: false }
    ]
  });

  if (!denuncia) throw new Error('Denuncia no encontrada');

  const afectados = Array.isArray((denuncia as any).afectados)
    ? (denuncia as any).afectados.map((a: any) => ({ ...a.get() }))
    : [];

  const idsAfectados = afectados.map((a: any) => a.id);

  // Queries en paralelo para mejor rendimiento
  const [vulneracionesIdent, medidasIdent, vulneracionesUnicas, medidasUnicas] = await Promise.all([
    // Obtener relaciones vulneraciones-afectados
    VulneracionesIdentificadas.findAll({
      where: { idAfectado: idsAfectados },
      attributes: ['idAfectado', 'idVulneracion']
    }),
    // Obtener relaciones medidas-afectados
    medidasIdentificadas.findAll({
      where: { idAfectado: idsAfectados },
      attributes: ['idAfectado', 'idMedida']
    }),
    // Obtener vulneraciones (se ejecutará después de tener los IDs)
    (async () => {
      const vulnIds = await VulneracionesIdentificadas.findAll({
        where: { idAfectado: idsAfectados },
        attributes: ['idVulneracion']
      });
      const idsUnicos = [...new Set(vulnIds.map(v => v.idVulneracion))];
      if (idsUnicos.length === 0) return [];
      
      const { Vulneracion } = await import('../models/vulneraciones.models');
      return Vulneracion.findAll({
        where: { id: idsUnicos },
        attributes: ['id', 'vulneracion']
      });
    })(),
    // Obtener medidas
    (async () => {
      const medIds = await medidasIdentificadas.findAll({
        where: { idAfectado: idsAfectados },
        attributes: ['idMedida']
      });
      const idsUnicos = [...new Set(medIds.map(m => m.idMedida))];
      if (idsUnicos.length === 0) return [];
      
      const { medida } = await import('../models/medidas_proteccion.models');
      return medida.findAll({
        where: { id: idsUnicos },
        attributes: ['id', 'medidas']
      });
    })()
  ]);

  // Crear mapas para acceso O(1)
  const vulneracionesMap = new Map(vulneracionesUnicas.map((v: any) => [v.id, v.vulneracion]));
  const medidasMap = new Map(medidasUnicas.map((m: any) => [m.id, m.medidas]));
  const afectadosMap = new Map(afectados.map((a: any) => [a.id, `${a.nombres} ${a.apellidos}`]));

  // Agrupar vulneraciones por afectado
  const mapVuln = new Map();
  vulneracionesIdent.forEach((v: any) => {
    if (!mapVuln.has(v.idAfectado)) {
      mapVuln.set(v.idAfectado, {
        idAfectado: v.idAfectado,
        nombre: afectadosMap.get(v.idAfectado) || '',
        vulneraciones: []
      });
    }
    const vulnDesc = vulneracionesMap.get(v.idVulneracion);
    if (vulnDesc) mapVuln.get(v.idAfectado).vulneraciones.push(vulnDesc);
  });
  const vulneraciones = Array.from(mapVuln.values());

  // Agrupar medidas por afectado
  const mapMed = new Map();
  medidasIdent.forEach((m: any) => {
    if (!mapMed.has(m.idAfectado)) {
      mapMed.set(m.idAfectado, {
        idAfectado: m.idAfectado,
        nombre: afectadosMap.get(m.idAfectado) || '',
        medidas: []
      });
    }
    const medDesc = medidasMap.get(m.idMedida);
    if (medDesc) mapMed.get(m.idAfectado).medidas.push(medDesc);
  });
  const medidas = Array.from(mapMed.values());

  // Extraer arrays de relaciones
  // Tipado explícito y solo alias Sequelize
  const denunciantes = Array.isArray((denuncia as any).Denunciantes)
    ? (denuncia as any).Denunciantes.map((d: any) => ({ ...d.get() }))
    : [];
  const denunciados = Array.isArray((denuncia as any).Denunciados)
    ? (denuncia as any).Denunciados.map((d: any) => ({ ...d.get() }))
    : [];

  // Obtener datos de denuncia mujeres si existe
  let datosViolencia = null;
  if ((denuncia as any).DM) {
    datosViolencia = {
      tipoDeViolencia: (denuncia as any).DM.tipoDeViolencia,
      ambitoViolencia: (denuncia as any).DM.ambitoViolencia
    };
  }

  return {
    denuncia: { ...denuncia.get() },
    afectados,
    denunciantes,
    denunciados,
    vulneraciones,
    medidas,
    datosViolencia
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
      vulneraciones = [],
      medidas = [],
      
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
  const numTramiteFormateado = denuncia.num_tramite.toString().padStart(4, '0');
  
  // Determinar el sufijo basado en el grupo prioritario
  const sufijo = denuncia.grupoPrioritario === 'nna' ? 'NIÑOS' : 
                 denuncia.grupoPrioritario === 'mujeres' ? 'MUJERES' : 'AM';
  denuncia.codigoTramite = `${numTramiteFormateado}-JCPD-${cantonName}-${currentYear}-${sufijo}`;


    const nuevaDenuncia = await Denuncia.create({...denuncia, estatus:'completada', codigoTramite: denuncia.codigoTramite}, { transaction: t });//agremamos la denuncia a la base de datos

    // Si el grupo prioritario es 'mujer', crear registro en denuncia_mujeres
    if (denuncia.grupoPrioritario === 'mujeres' ) {
      await DenunciaMujeres.create({
        idDenuncia: nuevaDenuncia.id,
        tipoDeViolencia: denuncia.tipoDeViolencia,
        ambitoViolencia: denuncia.ambitoViolencia,
      }, { transaction: t });
    }

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

    // Asociar vulneraciones por idAfectado
    for (const v of vulneraciones) {
      const realId = idMap.get(+v.idAfectado); // obtemos el id real del afectado 
      
      if (realId && v.vulneraciones.length) {
        const data = v.vulneraciones.map((id: number) => ({
          idAfectado: realId,
          idVulneracion: id,
        }));
        
        await VulneracionesIdentificadas.bulkCreate(data, { transaction: t });
      }
    }

    // Asociar medidas por idAfectado
    for (const m of medidas) {
      const realId = idMap.get(+m.idAfectado);
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
    
    // 2. Actualizar datos de violencia si es mujer
    if (denunciajson.denuncia.grupoPrioritario === 'mujeres') {
      await DenunciaMujeres.upsert({
        idDenuncia,
        tipoDeViolencia: denunciajson.denuncia.tipoDeViolencia,
        ambitoViolencia: denunciajson.denuncia.ambitoViolencia,
      }, { transaction: t });
    }

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
      if (denunciajson.vulneraciones) {
        for (const v of denunciajson.vulneraciones) {
          const realId = idMap.get(+v.idAfectado);
          if (realId && v.vulneraciones.length) {
            const data = v.vulneraciones.map((id: number) => ({ idAfectado: realId, idVulneracion: id }));
            await VulneracionesIdentificadas.bulkCreate(data, { transaction: t });
          }
        }
      }

      // Actualizar medidas
      await medidasIdentificadas.destroy({ where: { idAfectado: Array.from(idMap.values()) }, transaction: t });
      if (denunciajson.medidas) {
        for (const m of denunciajson.medidas) {
          const realId = idMap.get(+m.idAfectado);
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


