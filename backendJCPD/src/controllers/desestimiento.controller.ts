import { Request, Response } from 'express';
import * as desestimientoService from '../services/desestimiento.service';
import { handlehttp } from '../utils/error.handle';
import {  obtenerCodigoTramiteDenunciaDes } from '../services/desestimiento.service';

// Crear desestimiento
export const crearDesestimiento = async (req: Request, res: Response) => {
  try {
    const resultado = await desestimientoService.crearDesestimiento(req.body);
    res.status(201).json({
      message: 'Desestimiento creado exitosamente',
      data: resultado
    });
  } catch (error: any) {
    if (error.name === 'DenunciaNoEncontrada') {
      return res.status(404).json({ error: 'Denuncia no encontrada' });
    }
    if (error.name === 'DesestimientoExistente') {
      return res.status(409).json({ error: 'Ya existe un desestimiento para esta denuncia' });
    }
    console.error('Error al crear desestimiento:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};

// Controlador para obtener el código de trámite de una denuncia
export const getCodigoTramiteDenunciaDes = async (req: Request, res: Response) => {
  try {
    console.log("ID Denuncia recibido:", req.params.id);
    const idDenuncia = parseInt(req.params.id);
    

    if (isNaN(idDenuncia)) {
      return res.status(400).json({
        success: false,
        message: 'ID de denuncia inválido'
      });
    }

    const resultado = await desestimientoService.obtenerCodigoTramiteDenunciaDes(idDenuncia);
    res.json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al obtener código de trámite de denuncia', error);
  }
};



// Obtener desestimiento por ID
export const obtenerDesestimientoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await desestimientoService.obtenerDesestimientoPorId(parseInt(id));
    res.status(200).json({
      message: 'Desestimiento obtenido exitosamente',
      data: resultado
    });
  } catch (error: any) {
    if (error.name === 'DesestimientoNoEncontrado') {
      return res.status(404).json({ error: 'Desestimiento no encontrado' });
    }
    console.error('Error al obtener desestimiento por ID:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};

// Obtener desestimiento por ID de denuncia
export const obtenerDesestimientoPorDenuncia = async (req: Request, res: Response) => {
  try {
    const { idDenuncia } = req.params;
    const resultado = await desestimientoService.obtenerDesestimientoPorDenuncia(parseInt(idDenuncia));
    
    if (!resultado) {
      return res.status(404).json({
        message: 'No se encontró desestimiento para esta denuncia',
        data: null
      });
    }

    res.status(200).json({
      message: 'Desestimiento obtenido exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al obtener desestimiento por denuncia:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};



// Actualizar desestimiento
export const actualizarDesestimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await desestimientoService.actualizarDesestimiento(parseInt(id), req.body);
    res.status(200).json({
      message: 'Desestimiento actualizado exitosamente',
      data: resultado
    });
  } catch (error: any) {
    if (error.name === 'DesestimientoNoEncontrado') {
      return res.status(404).json({ error: 'Desestimiento no encontrado' });
    }
    if (error.name === 'DenunciaNoEncontrada') {
      return res.status(404).json({ error: 'Denuncia no encontrada' });
    }
    console.error('Error al actualizar desestimiento:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};






