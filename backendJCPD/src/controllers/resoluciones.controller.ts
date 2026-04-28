import { crearPdfResolucionNNA } from '../services/pdfs/resolucionespdf.service';
import { obtenerAfectados, crearResolucion, obtenerResolucionesPorDenuncia, obtenerResolucionCompleta, actualizarResolucion } from '../services/resoluciones.service';
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
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)

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
    },idUsuario,usuario,nombres,canton);

    res.status(201).json({
      success: true,
      message: 'Denuncia creada exitosamente',
      data: { id: resultado.id }
    });

  } catch (error) {
    handlehttp(res, 'Error al crear resolución', error);
  }
};

// Controlador para obtener resoluciones por denuncia (retorna solo ID)
export const getResolucionesPorDenuncia = async (req: Request, res: Response) => {
  try {
    const idDenuncia = parseInt(req.params.idDenuncia);

    if (isNaN(idDenuncia)) {
      return res.status(400).json({
        success: false,
        message: 'ID de denuncia inválido'
      });
    }
    

    const resultado = await obtenerResolucionesPorDenuncia(idDenuncia);
    
    res.json(resultado);

  } catch (error) {
    handlehttp(res, 'Error al obtener resoluciones', error);
  }
};

// Controlador para obtener resolución completa con todos los datos relacionados
export const getResolucionCompleta = async (req: Request, res: Response) => {
  try {
    const idResolucion = parseInt(req.params.id);

    if (isNaN(idResolucion)) {
      return res.status(400).json({
        success: false,
        message: 'ID de resolución inválido'
      });
    }

    const resolucionCompleta = await obtenerResolucionCompleta(idResolucion);
    
    res.json( resolucionCompleta);

  } catch (error) {
    handlehttp(res, 'Error al obtener resolución completa', error);
  }
};

// Controlador para actualizar una resolución
export const putActualizarResolucion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { codigoTramite, consideraciones, resolucion, pdf_resolucion, estatus } = req.body;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de resolución inválido'
      });
    }

    // Validar que al menos un campo sea proporcionado
    if (!codigoTramite && !consideraciones && !resolucion && !pdf_resolucion && !estatus) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    const resolucionActualizada = await actualizarResolucion(id, {
      codigoTramite,
      consideraciones,
      resolucion,
      pdf_resolucion,
      estatus
    },idUsuario,usuario,nombres,canton);

    res.json({
      success: true,
      message: 'Resolución actualizada exitosamente',
      data: resolucionActualizada
    });

  } catch (error) {
    handlehttp(res, 'Error al actualizar resolución', error);
  }
};

//----------------pdfs--------------------//
export const getResolucionPdf = async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
   const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
  await crearPdfResolucionNNA(res, Number(id),idUsuario,usuario,nombres,canton);
   
  } catch (error) {
  handlehttp(res, 'get_error_pdf_resolucion', error);
  }
};