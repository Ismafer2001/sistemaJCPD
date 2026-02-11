import { socketService } from '../index';
import { Request, Response } from 'express';
import * as inhibirseService from '../services/inhibirse.service';
import { handlehttp } from '../utils/error.handle';

// Crear inhibición
export const crearInhibicion = async (req: Request, res: Response) => {
  try {
    const idCantonDestino = String(req.body.idCantonDestino);
    const tramiteId = String(req.body.codigoTramite);
    const idCantonOrigen = String(req.body.idCantonOrigen);
    const resultado = await inhibirseService.crearInhibicion(req.body);
    socketService.notificarNuevoCaso(idCantonDestino, {
      mensaje: `Se ha recibido un nuevo expediente remitido.`,
      codigoTramite: tramiteId,
      origen: idCantonOrigen
    });
    res.status(201).json(resultado);
  } catch (error:any) {
    if ( error.name === "denunciayainhibida") {
      return res.status(400).json({ message: error.message });
    }


    
    handlehttp(res, 'Error interno del servidor', error);
  }
};

// Controlador para obtener el código de trámite de una denuncia
export const getCodigoTramiteInhibirse = async (req: Request, res: Response) => {
  try {
    console.log("ID Denuncia recibido:", req.params.id);
    const idDenuncia = parseInt(req.params.id);
    

    if (isNaN(idDenuncia)) {
      return res.status(400).json({
        success: false,
        message: 'ID de denuncia inválido'
      });
    }

    const resultado = await inhibirseService.obtenerCodigoTramiteInhibirse(idDenuncia);
    res.json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al obtener código de trámite de denuncia', error);
  }
};

// Controlador para obtener deprecatorias por idDenuncia
export const obtenerDeprecatoriasPorcanton = async (req: Request, res: Response) => {
  try {
    const idCanton = parseInt(req.params.idcanton);
    
    if (isNaN(idCanton)) {
      return res.status(400).json({
        success: false,
        message: 'ID de canton inválido'
      });
    }

    const resultado = await inhibirseService.obtenerDeprecatoriasPorCanton(idCanton);
    res.json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al obtener deprecatorias por canton', error);
  }
};

// Controlador para obtener deprecatorias pendientes por cantón
export const obtenerDeprecatoriasPendientesPorCanton = async (req: Request, res: Response) => {
  try {
    const idCanton = parseInt(req.params.idcanton);
    
    if (isNaN(idCanton)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cantón inválido'
      });
    }

    const resultado = await inhibirseService.obtenerDeprecatoriasPendientesPorCanton(idCanton);
    res.json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al obtener deprecatorias pendientes', error);
  }
};



// Controlador para obtener una deprecatoria por ID
export const obtenerDeprecatoriaPorId = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de deprecatoria inválido'
      });
    }

    const resultado = await inhibirseService.obtenerDeprecatoriaPorId(id);
    res.json(resultado);
  } catch (error) {
    if (error instanceof Error && error.message === 'Deprecatoria no encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Deprecatoria no encontrada'
      });
    }
    handlehttp(res, 'Error al obtener deprecatoria', error);
  }
};

// Controlador para aceptar una inhibición
export const aceptarInhibicion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de deprecatoria inválido'
      });
    }

    const resultado = await inhibirseService.aceptarInhibicion(id);
    res.json(resultado);
  } catch (error) {
    if (error instanceof Error && error.message === 'Deprecatoria no encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Deprecatoria no encontrada'
      });
    }
    handlehttp(res, 'Error al aceptar inhibición', error);
  }
};


