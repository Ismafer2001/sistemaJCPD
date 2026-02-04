import sequelize from "../config/database";
import { Informe } from "../models/informe.models";
import { Avocatoria, Denuncia } from "../models";
import { usuarios } from "../models/usuarios.models";

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
  const informe = await Informe.findByPk(id, {
    include: [
      {
        model: Denuncia,
        as: 'DenunciaInforme',
        attributes: ['id_canton'],
        include: [
          {
            model: Avocatoria,
            as: 'avocatoria',
            attributes: ['fechaCreado']
          },
          {
            model: require('../models/cantones.models').Canton,
            as: 'canton',
            attributes: ['canton']
          }
        ]
      }
    ]
  });
  console.log('aquiiiiIIIII MIRAAAAAAAAAAAAAAAAAAAAAAA'+informe);
  
  if (!informe) {
    throw new Error('Informe no encontrado');
  }

  const informeData = informe as any;
  
  // Obtener usuarios principales activos del cantón
  let usuariosPrincipales: any[] = [];
  const denuncia = informeData.DenunciaInforme;
  
  if (denuncia && denuncia.id_canton) {
    usuariosPrincipales = await usuarios.findAll({
      where: {
        id_canton: denuncia.id_canton,
        rol: 'principal',
        isactivo: true
      },
      attributes: ['id', 'nombres', 'apellidos', 'correo', 'rol', 'id_canton']
    });
  }

  return {
    id: informe.id,
    idDenuncia: informe.idDenuncia,
    nombre: informe.nombre,
    dirigidoA: informe.dirigidoA,
    numeroOficio: informe.numeroOficio,
    codigoTramite: informe.codigoTramite,
    transcripcion: informe.transcripcion,
    fechaCreado: informeData.fechaCreado,
    canton: informeData.DenunciaInforme?.canton?.canton || '',
    fechaCreacionAvocatoria: informeData.DenunciaInforme?.avocatoria?.fechaCreado || null,
    usuariosPrincipalesCanton: usuariosPrincipales
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

// Servicio para actualizar un informe
export async function actualizarInforme(id: number, data: Partial<InformeDTO>) {
  const t = await sequelize.transaction();
  try {
    // Verificar que el informe existe
    const informeExiste = await Informe.findByPk(id);
    
    if (!informeExiste) {
      throw new Error('Informe no encontrado');
    }

    // Actualizar el informe
    const [filasActualizadas] = await Informe.update(
      {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.dirigidoA && { dirigidoA: data.dirigidoA }),
        ...(data.numeroOficio && { numeroOficio: data.numeroOficio }),
        ...(data.codigoTramite && { codigoTramite: data.codigoTramite }),
        ...(data.transcripcion && { transcripcion: data.transcripcion })
      },
      { 
        where: { id },
        transaction: t 
      }
    );

    if (filasActualizadas === 0) {
      throw new Error('No se pudo actualizar el informe');
    }

    // Obtener el informe actualizado
    const informeActualizado = await Informe.findByPk(id, { transaction: t });

    await t.commit();
    
    return {
      success: true,
      message: 'Informe actualizado correctamente',
      data: informeActualizado
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
}





