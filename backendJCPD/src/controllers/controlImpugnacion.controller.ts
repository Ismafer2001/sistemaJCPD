import { Request, Response } from 'express';
import { 
  crearControlImpugnacion, 
 
  actualizarControlImpugnacion, 
  
  obtenerCodigoTramiteDenuncia,
  obtenerControlImpugnacionPorDenuncia
} from '../services/controlImpugnacion.service';
import { handlehttp } from '../utils/error.handle';

// Controlador para crear un control de impugnación
export const postCrearControlImpugnacion = async (req: Request, res: Response) => {
  try {
    const { idResolucion, codigoTramite, resolucionImpugnada, recurso_impugnacion,resultado, periodo, estatus } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!idResolucion || !codigoTramite || !resolucionImpugnada || !recurso_impugnacion) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: idResolucion, codigoTramite, resolucionImpugnada, recurso_impugnacion'
      });
    }

    const resultadoImpugnacion = await crearControlImpugnacion({
      idResolucion: parseInt(idResolucion),
      codigoTramite,
      resolucionImpugnada,
      recurso_impugnacion,
      resultado,
      periodo,
      estatus
    });

    res.status(201).json(resultadoImpugnacion);

  } catch (error) {
    handlehttp(res, 'Error al crear control de impugnación', error);
  }
};



// Controlador para obtener controles de impugnación por resolución
export const getControlImpugnacionPorDenuncia = async (req: Request, res: Response) => {
  try {
    const idResolucion = parseInt(req.params.idResolucion);

    if (isNaN(idResolucion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de resolución inválido'
      });
    }

    const controles = await obtenerControlImpugnacionPorDenuncia(idResolucion);
    res.json(controles);

  } catch (error) {
    handlehttp(res, 'Error al obtener controles de impugnación', error);
  }
};



// Controlador para actualizar un control de impugnación
export const putActualizarControlImpugnacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { codigoTramite, resolucionImpugnada, resultadoImpugnacion, estatus } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de control de impugnación inválido'
      });
    }

    // Validar que al menos un campo esté presente para actualizar
    if (!codigoTramite && !resolucionImpugnada && !resultadoImpugnacion && !estatus) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    const resultado = await actualizarControlImpugnacion(id, {
      codigoTramite,
      resolucionImpugnada,
      resultadoImpugnacion,
     
    });

    res.json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al actualizar control de impugnación', error);
  }
};



// Controlador para obtener el código de trámite de una denuncia
export const getCodigoTramiteDenuncia = async (req: Request, res: Response) => {
  try {
    console.log("ID Denuncia recibido:", req.params.id);
    const idDenuncia = parseInt(req.params.id);
    

    if (isNaN(idDenuncia)) {
      return res.status(400).json({
        success: false,
        message: 'ID de denuncia inválido'
      });
    }

    const resultado = await obtenerCodigoTramiteDenuncia(idDenuncia);
    
    res.json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al obtener código de trámite de denuncia', error);
  }
};
