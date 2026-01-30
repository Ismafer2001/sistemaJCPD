import sequelize from "../config/database";
import { Informe } from "../models/informe.models";
import { Avocatoria, Denuncia } from "../models";

export interface InformeDTO {
  idDenuncia: number;
  nombre: string;
  dirigidoA: string;
  numeroOficio: string;
  codigoTramite: string;
  transcripcion: string;
}

//servicio para crear informe
export async function crearInforme(data: InformeDTO) {
  const t = await sequelize.transaction();
  try {
    const informe = await Informe.create({
      idDenuncia: data.idDenuncia,
      nombre: data.nombre,
      dirigidoA: data.dirigidoA,
      numeroOficio: data.numeroOficio,
      codigoTramite: data.codigoTramite,
      transcripcion: data.transcripcion
    }, { transaction: t });

    await t.commit();
    return informe;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

//servicio para obtener informes de una denuncia
export async function obtenerInformesPorDenuncia(idDenuncia: number) {
  const informes = await Informe.findAll({
    where: { idDenuncia },
    attributes: ['id', 'idDenuncia', 'dirigidoA']
  });

  return informes.map(informe => ({
    id: informe.id,
    idDenuncia: informe.idDenuncia,
    diriguidoA: informe.dirigidoA
  }));
}

//servicio para obtener datos completos de un informe
export async function obtenerInformePorId(id: number) {

    console.log('ID recibido en el servicio:'+id);
  const informe = await Informe.findByPk(id);
  console.log('aquiiiiIIIII MIRAAAAAAAAAAAAAAAAAAAAAAA'+informe);
  
  if (!informe) {
    throw new Error('Informe no encontrado');
  }

  return {
    id: informe.id,
    idDenuncia: informe.idDenuncia,
    nombre: informe.nombre,
    dirigidoA: informe.dirigidoA,
    numeroOficio: informe.numeroOficio,
    codigoTramite: informe.codigoTramite,
    transcripcion: informe.transcripcion,
    fechaCreado: (informe as any).fechaCreado
  };
}

//servicio para obtener fecha de creación y código de trámite de avocatoria
export async function datosParaInforme(idDenuncia: number) {
  const denuncia = await Denuncia.findByPk(idDenuncia, {
    include: [
      {
        model: Avocatoria,
        as: 'avocatoria',
        attributes: ['fechaCreado', 'codigoTramite']
      }
    ]
  });

  if (!denuncia || !denuncia.avocatoria) {
    throw new Error('No se encontró avocatoria para esta denuncia');
  }

  return {
    fechaCreado: (denuncia.avocatoria as any).fechaCreado,
    codigoTramite: denuncia.avocatoria.codigoTramite
  };
}




