import sequelize from "../config/database";
import { Desestimiento } from "../models/desestimiento.models";
import { Denuncia, Canton } from "../models";

export interface DesestimientoDTO {
  idDenuncia: number;
  codigoTramite: string;
  resultado_desestimiento: string;
  estatus?: "pendiente" | "en_proceso" | "completada";
}

//servicio para crear desestimiento
export async function crearDesestimiento(data: DesestimientoDTO) {
  const t = await sequelize.transaction();
  try {
    // Verificar que existe la denuncia
    const existeDenuncia = await Denuncia.findByPk(data.idDenuncia);
    
    if (!existeDenuncia) {
      const error = new Error("No existe una denuncia con el id proporcionado");
      error.name = "DenunciaNoEncontrada";
      throw error;
    }

    // Verificar que no existe ya un desestimiento para esta denuncia
    const existeDesestimiento = await Desestimiento.findOne({ 
      where: { idDenuncia: data.idDenuncia } 
    });

    if (existeDesestimiento) {
      const error = new Error("Ya existe un desestimiento para esta denuncia");
      error.name = "DesestimientoExistente";
      throw error;
    }

    const desestimiento = await Desestimiento.create({
      idDenuncia: data.idDenuncia,
      codigoTramite: data.codigoTramite,
      resultado_desestimiento: data.resultado_desestimiento,
      estatus: data.estatus || 'completada'
    }, { transaction: t });

    await t.commit();
    return desestimiento;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
// Servicio para obtener el código de trámite de una denuncia específica
export async function obtenerCodigoTramiteDenunciaDes(id: number) {
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



//servicio para obtener un desestimiento por id
export async function obtenerDesestimientoPorId(id: number) {
  const desestimiento = await Desestimiento.findByPk(id, {
    include: [
      {
        model: Denuncia,
        attributes: ['codigoTramite'],
        include: [
          {
            model: Canton,
            as: 'canton',
            attributes: ['canton']
          }
        ]
      }
    ]
  });

  if (!desestimiento) {
    const error = new Error("No se encontró el desestimiento con el id proporcionado");
    error.name = "DesestimientoNoEncontrado";
    throw error;
  }

  return {
    id: desestimiento.id,
    idDenuncia: desestimiento.idDenuncia,
    codigoTramite: desestimiento.codigoTramite,
    resultado_desestimiento: desestimiento.resultado_desestimiento,
    estatus: desestimiento.estatus,
    fechaCreado: (desestimiento as any).fechaCreado,
    fechaActualizado: (desestimiento as any).fechaActualizado,
    denuncia: {
      codigoTramite: (desestimiento as any).Denuncia?.codigoTramite || '',
      canton: (desestimiento as any).Denuncia?.canton?.canton || ''
    }
  };
}

//servicio para obtener desestimiento por idDenuncia
export async function obtenerDesestimientoPorDenuncia(idDenuncia: number) {
  const desestimiento = await Desestimiento.findOne({
    where: { idDenuncia },
    include: [
      {
        model: Denuncia,
        attributes: ['codigoTramite'],
        include: [
          {
            model: Canton,
            as: 'canton',
            attributes: ['canton']
          }
        ]
      }
    ]
  });

  if (!desestimiento) {
    return null; // No lanzar error, simplemente retornar null si no existe
  }

  return {
    id: desestimiento.id,
    idDenuncia: desestimiento.idDenuncia,
    codigoTramite: desestimiento.codigoTramite,
    resultado_desestimiento: desestimiento.resultado_desestimiento,
    estatus: desestimiento.estatus,
    fechaCreado: (desestimiento as any).fechaCreado,
    fechaActualizado: (desestimiento as any).fechaActualizado,
    denuncia: {
      codigoTramite: (desestimiento as any).Denuncia?.codigoTramite || '',
      canton: (desestimiento as any).Denuncia?.canton?.canton || ''
    }
  };
}

//servicio para actualizar desestimiento
export async function actualizarDesestimiento(id: number, data: Partial<DesestimientoDTO>) {
  const t = await sequelize.transaction();
  try {
    const desestimiento = await Desestimiento.findByPk(id);
    
    if (!desestimiento) {
      const error = new Error("No se encontró el desestimiento con el id proporcionado");
      error.name = "DesestimientoNoEncontrado";
      throw error;
    }

    // Si se está cambiando la denuncia, verificar que existe
    if (data.idDenuncia && data.idDenuncia !== desestimiento.idDenuncia) {
      const existeDenuncia = await Denuncia.findByPk(data.idDenuncia);
      if (!existeDenuncia) {
        const error = new Error("No existe una denuncia con el id proporcionado");
        error.name = "DenunciaNoEncontrada";
        throw error;
      }
    }

    await desestimiento.update({
      ...(data.idDenuncia && { idDenuncia: data.idDenuncia }),
      ...(data.codigoTramite && { codigoTramite: data.codigoTramite }),
      ...(data.resultado_desestimiento && { resultado_desestimiento: data.resultado_desestimiento }),
      ...(data.estatus && { estatus: data.estatus })
    }, { transaction: t });

    await t.commit();
    return desestimiento;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

