import { Request, Response } from 'express';
import * as informesService from '../services/informes.service';
import { handlehttp } from '../utils/error.handle';
import { crearPdfinformeNNA } from '../services/pdfs/informepdf.service';

// Crear informe
export const crearInforme = async (req: Request, res: Response) => {
  try {
    const resultado = await informesService.crearInforme(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error al crear informe:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};

// Obtener informes por denuncia
export const obtenerInformesPorDenuncia = async (req: Request, res: Response) => {
  try {
    const { idDenuncia } = req.params;
    const resultado = await informesService.obtenerInformesPorDenuncia(parseInt(idDenuncia));
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al obtener informes por denuncia:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};

// Obtener informe por ID
export const obtenerInformePorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await informesService.obtenerInformePorId(parseInt(id));
    res.status(200).json(resultado);
  } catch (error: any) {
    if (error.message === 'Informe no encontrado') {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }
    console.error('Error al obtener informe por ID:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};

// Obtener datos para informe por denuncia
export const obtenerDatosParaInforme = async (req: Request, res: Response) => {
  try {
    const { idDenuncia } = req.params;
    const resultado = await informesService.datosParaInforme(parseInt(idDenuncia));
    res.status(200).json(resultado);
  } catch (error: any) {
    if (error.message === 'No se encontró avocatoria para esta denuncia') {
      return res.status(404).json({ error: 'No se encontró avocatoria para esta denuncia' });
    }
    console.error('Error al obtener avocatoria por denuncia:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};

export const getInformePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await crearPdfinformeNNA(res, Number(id));
   
  } catch (error) {
    handlehttp(res, 'get_error_pdf_providencia', error);
  }
};

// Actualizar informe
export const actualizarInforme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idInforme = parseInt(id);

    if (isNaN(idInforme)) {
      return res.status(400).json({
        success: false,
        message: 'ID de informe inválido'
      });
    }

    // Validar que hay campos para actualizar
    const { nombre, dirigidoA, numeroOficio, codigoTramite, transcripcion } = req.body;
    
    if (!nombre && !dirigidoA && !numeroOficio && !codigoTramite && !transcripcion) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    const resultado = await informesService.actualizarInforme(idInforme, req.body);
    res.status(200).json(resultado);

  } catch (error: any) {
    if (error.message === 'Informe no encontrado') {
      return res.status(404).json({ 
        success: false,
        message: 'Informe no encontrado' 
      });
    }
    if (error.message === 'No se pudo actualizar el informe') {
      return res.status(400).json({ 
        success: false,
        message: 'No se pudo actualizar el informe' 
      });
    }
    console.error('Error al actualizar informe:', error);
    handlehttp(res, 'Error interno del servidor', error);
  }
};
