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

   console.log(denuncia.num_tramite);



    //

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
