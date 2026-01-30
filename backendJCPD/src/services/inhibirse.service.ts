import sequelize from "../config/database";
import { Denuncia } from "../models";
import { Deprecatoria } from "../models/deprecatoria.models";
import { Canton } from "../models/cantones.models";
import { Afectado } from "../models/afectado.models";
import { Denunciante } from "../models/denunciante.models";

export interface InhibicionDTO {
  idDenuncia: number;
  idCantonOrigen: number;
  idCantonDestino: number;
  motivoDeInhibirse: string;
  estadoRecepcion: string;
    codigoTramite: string;
}

//servicio para crear inhibición
export async function crearInhibicion(data: InhibicionDTO) {
  const t = await sequelize.transaction();
  try {
    const inhibicion = await Deprecatoria.create({
      idDenuncia: data.idDenuncia,
      idCantonOrigen: data.idCantonOrigen,
      idCantonDestino: data.idCantonDestino,
      motivoDeInhibirse: data.motivoDeInhibirse,
      codigoTramite: data.codigoTramite,
      estadoRecepcion: 'pendiente'
    }, { transaction: t });

    // Actualizar el estado de la denuncia a 'remitido'
    await Denuncia.update(
      { estado: 'remitido' },
      { 
        where: { id: data.idDenuncia },
        transaction: t 
      }
    );

    await t.commit();
    return inhibicion;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

// Servicio para obtener el código de trámite de una denuncia específica
export async function obtenerCodigoTramiteInhibirse(id: number) {
  try {
    const denuncia = await Denuncia.findByPk(id, {
      attributes: ['id','codigoTramite'],

      
    });

    if (!denuncia) {
      throw new Error('Denuncia no encontrada');
    }

    const denunciaData = denuncia as any;
    
   

    return {
      idDenuncia: denunciaData.id,
      codigoTramite: denunciaData.codigoTramite
    };

  } catch (error) {
    throw error;
  }
}

// Servicio para obtener todas las deprecatorias por idCanton con información de la denuncia
export async function obtenerDeprecatoriasPorCanton(idCanton: number) {
  try {
    const deprecatorias = await Deprecatoria.findAll({
      where: {
        idCantonDestino: idCanton
      },
      include: [
        {
          model: Denuncia,
          as: 'DenunciaDeprecatoria',
          attributes: ['id', 'codigoTramite'],
          include: [
            {
              model: Afectado,
              as: 'afectados',
              attributes: ['id', 'cedula', 'nombres', 'apellidos']
            }
          ]
        },
        {
          model: Canton,
          as: 'cantonOrigen',
          attributes: ['id', 'canton']
        }
        
      ],
      attributes: ['id','idDenuncia', 'codigoTramite', 'estadoRecepcion','motivoDeInhibirse']
    });

    // Formatear la respuesta según el formato solicitado
    const deprecatoriasFormateadas = deprecatorias.map((deprecatoria: any) => {
      return {
        id: deprecatoria.id,
        idDenuncia: deprecatoria.idDenuncia,
        codigoTramite: deprecatoria.codigoTramite,
        estadoRecepcion: deprecatoria.estadoRecepcion,
        motivo: deprecatoria.motivoDeInhibirse,
        cantonOrigen: {
          id: deprecatoria.cantonOrigen?.id,
          nombre: deprecatoria.cantonOrigen?.canton
        },
        
        afectados: deprecatoria.DenunciaDeprecatoria?.afectados?.map((afectado: any) => ({
          id: afectado.id,
          cedula: afectado.cedula,
          nombres: afectado.nombres,
          apellidos: afectado.apellidos
        })) || []
      };
    });

    return deprecatoriasFormateadas;

  } catch (error) {
    throw error;
  }
}



// Servicio para obtener una deprecatoria por ID
export async function obtenerDeprecatoriaPorId(id: number) {
  try {
    const deprecatoria = await Deprecatoria.findByPk(id, {
      include: [
       
        {
          model: Canton,
          as: 'cantonOrigen',
          attributes: ['id', 'canton']
        },
        
      ]
    });

    if (!deprecatoria) {
      throw new Error('Deprecatoria no encontrada');
    }

    const deprecatoriaData = deprecatoria as any;

    return {
      id: deprecatoriaData.id,
      idDenuncia: deprecatoriaData.idDenuncia,
      codigoTramite: deprecatoriaData.codigoTramite,
      motivoDeInhibirse: deprecatoriaData.motivoDeInhibirse,
      estadoRecepcion: deprecatoriaData.estadoRecepcion,
      fechaCreacion: deprecatoriaData.createdAt,
      fechaActualizacion: deprecatoriaData.updatedAt,
      cantonOrigen: {
        id: deprecatoriaData.cantonOrigen?.id,
        nombre: deprecatoriaData.cantonOrigen?.canton
      }
    };
  } catch (error) {
    throw error;
  }
}

// Servicio para aceptar una inhibición
export async function aceptarInhibicion(idDeprecatoria: number) {
  const t = await sequelize.transaction();
  try {
    // Buscar la deprecatoria para obtener el idDenuncia e idCantonDestino
    const deprecatoria = await Deprecatoria.findByPk(idDeprecatoria, {
      include: [{
        model: Canton,
        as: 'cantonDestino',
        attributes: ['id', 'canton']
      }]
    });
    
    if (!deprecatoria) {
      throw new Error('Deprecatoria no encontrada');
    }

    const deprecatoriaData = deprecatoria as any;
    const idDenuncia = deprecatoriaData.idDenuncia;
    const idCantonDestino = deprecatoriaData.idCantonDestino;
    const nombreCantonDestino = deprecatoriaData.cantonDestino?.canton;

    // Obtener información de la denuncia original para el grupo prioritario
    const denunciaOriginal = await Denuncia.findByPk(idDenuncia, {
      attributes: ['grupoPrioritario']
    });

    if (!denunciaOriginal) {
      throw new Error('Denuncia no encontrada');
    }

    const grupoPrioritario = (denunciaOriginal as any).grupoPrioritario;

    // Obtener el último número de trámite para el cantón destino en el año actual
    const anioActual = new Date().getFullYear();
    const ultimaDenuncia = await Denuncia.findOne({
      where: { 
        id_canton: idCantonDestino,
        anio: anioActual
      },
      order: [['num_tramite', 'DESC']],
      attributes: ['num_tramite']
    });

    const nuevoNumTramite = ultimaDenuncia ? ((ultimaDenuncia as any).num_tramite + 1) : 1;

    // Generar el nuevo código de trámite
    const numeroFormateado = nuevoNumTramite.toString().padStart(4, '0');
    let tipoGrupo = '';
    
    switch(grupoPrioritario) {
      case 'nna':
        tipoGrupo = 'NIÑOS';
        break;
      case 'mujeres':
        tipoGrupo = 'MUJERES';
        break;
      case 'adultos':
        tipoGrupo = 'AM';
        break;
      default:
        tipoGrupo = 'GENERAL';
    }

    const nuevoCodigoTramite = `${numeroFormateado}-JCPD-${nombreCantonDestino}-${anioActual}-${tipoGrupo}`;

    // Actualizar el estado de recepción de la deprecatoria a 'aceptada'
    await Deprecatoria.update(
      { estadoRecepcion: 'aceptada' },
      { 
        where: { id: idDeprecatoria },
        transaction: t 
      }
    );

    // Actualizar la denuncia: estado, cantón, número y código de trámite
    await Denuncia.update(
      { 
        estado: 'activa',
        id_canton: idCantonDestino,
        num_tramite: nuevoNumTramite,
        anio: anioActual,
        codigoTramite: nuevoCodigoTramite
      },
      { 
        where: { id: idDenuncia },
        transaction: t 
      }
    );

    await t.commit();
    
    return { 
      success: true, 
      message: 'Inhibición aceptada correctamente',
      deprecatoriaId: idDeprecatoria,
      denunciaId: idDenuncia,
      nuevoCantonId: idCantonDestino,
      nuevoCantonNombre: nombreCantonDestino,
      nuevoNumTramite: nuevoNumTramite,
      nuevoCodigoTramite: nuevoCodigoTramite
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}









