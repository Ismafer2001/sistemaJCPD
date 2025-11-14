import sequelize from '../config/database';
import { ControlImpugnacion, Resoluciones, Denuncia } from "../models";

// Servicio para crear un control de impugnación
export async function crearControlImpugnacion(data: {
  idResolucion: number;
  codigoTramite: string;
  resolucionImpugnada: string;
  resultadoImpugnacion: string;
  estatus?: "pendiente" | "en_proceso" | "completada";
}) {
  const t = await sequelize.transaction();
  try {
    // Validar que todos los campos requeridos estén presentes
    if (!data.idResolucion || !data.codigoTramite || !data.resolucionImpugnada || !data.resultadoImpugnacion) {
      throw new Error('Todos los campos son requeridos: idResolucion, codigoTramite, resolucionImpugnada, resultadoImpugnacion');
    }

    // Verificar que la resolución existe
    const resolucionExiste = await Resoluciones.findByPk(data.idResolucion);
    if (!resolucionExiste) {
      throw new Error('La resolución especificada no existe');
    }

    // Verificar que el código sea único
    const existeCodigo = await ControlImpugnacion.findOne({
      where: { codigoTramite: data.codigoTramite }
    });

    if (existeCodigo) {
      throw new Error('El código de trámite ya existe');
    }

    // Crear el control de impugnación
    const nuevoControl = await ControlImpugnacion.create({
      idResolucion: data.idResolucion,
      codigoTramite: data.codigoTramite,
      resolucionImpugnada: data.resolucionImpugnada,
      resultadoImpugnacion: data.resultadoImpugnacion,
      estatus: 'completada'
    }, { transaction: t });

    await t.commit();
    return nuevoControl;

  } catch (error) {
    await t.rollback();
    throw error;
  }
}

// Servicio para obtener controles de impugnación por resolución
export async function obtenerControlImpugnacionPorResolucion(idResolucion: number) {
  try {
    const controles = await ControlImpugnacion.findAll({
      where: { idResolucion },
      include: [
        {
          model: Resoluciones,
          as: 'Resolucion',
          attributes: ['codigoTramite', 'resolucion']
        }
      ],
      order: [['fechaCreado', 'DESC']]
    });

    return {
      success: true,
      data: controles,
      count: controles.length
    };

  } catch (error) {
    throw error;
  }
}

// Servicio para obtener un control de impugnación por ID
export async function obtenerControlImpugnacionPorId(id: number) {
  try {
    const control = await ControlImpugnacion.findByPk(id, {
      include: [
        {
          model: Resoluciones,
          as: 'Resolucion',
          attributes: ['codigoTramite', 'resolucion', 'consideraciones']
        }
      ]
    });

    if (!control) {
      throw new Error('Control de impugnación no encontrado');
    }

    return {
      success: true,
      data: control
    };

  } catch (error) {
    throw error;
  }
}

// Servicio para actualizar un control de impugnación
export async function actualizarControlImpugnacion(id: number, data: {
  codigoTramite?: string;
  resolucionImpugnada?: string;
  resultadoImpugnacion?: string;
  
}) {
  const t = await sequelize.transaction();
  try {
    const control = await ControlImpugnacion.findByPk(id);
    if (!control) {
      throw new Error('Control de impugnación no encontrado');
    }

    // Si se está actualizando el código, verificar que sea único
    if (data.codigoTramite && data.codigoTramite !== control.codigoTramite) {
      const existeCodigo = await ControlImpugnacion.findOne({
        where: { codigoTramite: data.codigoTramite }
      });

      if (existeCodigo) {
        throw new Error('El código de trámite ya existe');
      }
    }

    // Actualizar solo los campos proporcionados
    const camposActualizar: any = {};
    if (data.codigoTramite) camposActualizar.codigoTramite = data.codigoTramite;
    if (data.resolucionImpugnada) camposActualizar.resolucionImpugnada = data.resolucionImpugnada;
    if (data.resultadoImpugnacion) camposActualizar.resultadoImpugnacion = data.resultadoImpugnacion;
   

    await control.update(camposActualizar, { transaction: t });

    await t.commit();
    return {
      success: true,
      message: 'Control de impugnación actualizado exitosamente',
      data: control
    };

  } catch (error) {
    await t.rollback();
    throw error;
  }
}

// Servicio para obtener todos los controles de impugnación
export async function obtenerTodosLosControlesImpugnacion() {
  try {
    const controles = await ControlImpugnacion.findAll({
      include: [
        {
          model: Resoluciones,
          as: 'Resolucion',
          attributes: ['codigoTramite', 'resolucion']
        }
      ],
      order: [['fechaCreado', 'DESC']]
    });

    return {
      success: true,
      data: controles,
      count: controles.length
    };

  } catch (error) {
    throw error;
  }
}

// Servicio para obtener el código de trámite de una denuncia específica
export async function obtenerCodigoTramiteDenuncia(id: number) {
  try {
    const denuncia = await Denuncia.findByPk(id, {
      attributes: [],

      include: [
        {
          model: Resoluciones,
          as: 'resoluciones',
          attributes: ['id', 'codigoTramite'],
          
        }
      ]
    });

    if (!denuncia) {
      throw new Error('Denuncia no encontrada');
    }

    const denunciaData = denuncia as any;
    
    // Formatear respuesta con solo idResolucion y codigoTramite
    const resolucion = denunciaData.resoluciones && denunciaData.resoluciones.length > 0 
      ? denunciaData.resoluciones[0] 
      : null;

    return {
      idResolucion: resolucion ? resolucion.id : null,
      codigoTramite: resolucion ? resolucion.codigoTramite : null
    };

  } catch (error) {
    throw error;
  }
}
