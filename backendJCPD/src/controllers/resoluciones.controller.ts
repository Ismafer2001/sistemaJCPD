import { crearPdfResolucionNNA } from '../services/pdfs/resolucionespdf.service';
import { obtenerAfectados, crearResolucion, obtenerResolucionesPorDenuncia, obtenerResolucionPorId } from '../services/resoluciones.service';
import { handlehttp } from '../utils/error.handle';
import { Request, Response } from 'express';

//controlador para obtener los afectados de una denuncia seleccionada
export const getAfectados = async (req: Request, res: Response) => {

  try {
     const id = parseInt(req.params.id);
  console.log("ID recibido:", id); 
  const afectados = await obtenerAfectados(id);
  res.json(afectados);
    
  } catch (error) {
    handlehttp(res,'error_get_afectadosavocatoria',error)
    
  }
 
}

// Controlador para crear una nueva resolución
export const postCrearResolucion = async (req: Request, res: Response) => {
  try {
    const { codigoTramite, consideraciones, resolucion, pdf_resolucion, idDenuncia } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!codigoTramite || !consideraciones || !resolucion || !idDenuncia) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: codigoTramite, consideraciones, resolucion, idDenuncia'
      });
    }

    const resultado = await crearResolucion({
      codigoTramite,
      consideraciones,
      resolucion,
      pdf_resolucion: pdf_resolucion || '',
      idDenuncia: parseInt(idDenuncia)
    });

    res.status(201).json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al crear resolución', error);
  }
};

// Controlador para obtener resoluciones por denuncia
export const getResolucionesPorDenuncia = async (req: Request, res: Response) => {
  try {
    const idDenuncia = parseInt(req.params.idDenuncia);

    if (isNaN(idDenuncia)) {
      return res.status(400).json({
        success: false,
        message: 'ID de denuncia inválido'
      });
    }

    const resoluciones = await obtenerResolucionesPorDenuncia(idDenuncia);
    res.json(resoluciones);

  } catch (error) {
    handlehttp(res, 'Error al obtener resoluciones', error);
  }
};

// Controlador para obtener una resolución por ID
export const getResolucionPorId = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de resolución inválido'
      });
    }

    const resolucion = await obtenerResolucionPorId(id);
    res.json(resolucion);

  } catch (error) {
    handlehttp(res, 'Error al obtener resolución', error);
  }
};


//----------------pdfs--------------------//
export const getResolucionPdf = async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
  await crearPdfResolucionNNA(res, Number(id));
   
  } catch (error) {
  handlehttp(res, 'get_error_pdf_resolucion', error);
  }
};