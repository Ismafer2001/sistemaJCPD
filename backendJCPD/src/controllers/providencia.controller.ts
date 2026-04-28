import { Request, Response } from 'express';
import { crearProvidencia, obtenerDatosProvidenciaCompleta, obtenerIdProvidenciaPorDenuncia, actualizarProvidencia } from '../services/providencia.service';
import { handlehttp } from '../utils/error.handle';
import { crearPdfProvidenciaNNA } from '../services/pdfs/providenciapdf.service';

/**
 * Controlador para crear una nueva providencia
 */
export const createProvidencia = async (req: Request, res: Response) => {
    try {
        const {
            articulos,
            suscrito,
            nombreSuscrito,
            cargoSuscrito,
            institucionSuscrito,
            disposiciones,
            codigoTramite,
            idDenuncia,
            pdf_providencia
        } = req.body;
         const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)

        // Validaciones básicas
        if (!articulos || !suscrito || !nombreSuscrito || !disposiciones || !codigoTramite || !idDenuncia) {
            return res.status(400).json({
                error: 'Faltan campos requeridos',
                requeridos: ['articulos', 'suscrito', 'nombreSuscrito', 'disposiciones', 'codigoTramite', 'idDenuncia']
            });
        }

        const nuevaProvidencia = await crearProvidencia({
            articulos,
            suscrito,
            nombreSuscrito,
            cargoSuscrito,
            institucionSuscrito,
            disposiciones,
            codigoTramite,
            idDenuncia,
            pdf_providencia
        },idUsuario,usuario,nombres,canton);

        res.status(201).json(nuevaProvidencia);

    } catch (error: any) {
        
        handlehttp(res, 'ERROR_CREATE_PROVIDENCIA', error);
    }
};

/**
 * Controlador para obtener una providencia por ID
 */
export const getProvidenciaById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        // Validar que el ID sea un número válido
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                error: 'ID de providencia inválido'
            });
        }

        const providencia = await obtenerDatosProvidenciaCompleta(id);

        if (!providencia) {
            return res.status(404).json({
                error: 'Providencia no encontrada'
            });
        }

        res.json(providencia);

    } catch (error: any) {
        
        handlehttp(res, 'ERROR_GET_PROVIDENCIA', error);
    }
};

/**
 * Controlador para obtener ID de providencia por ID de denuncia
 */
export const getProvidenciaIdByDenunciaId = async (req: Request, res: Response) => {
    try {
        const idDenuncia = parseInt(req.params.idDenuncia);

        // Validar que el ID de denuncia sea un número válido
        if (isNaN(idDenuncia) || idDenuncia <= 0) {
            return res.status(400).json({
                error: 'ID de denuncia inválido'
            });
        }

        const idProvidencia = await obtenerIdProvidenciaPorDenuncia(idDenuncia);

        if (!idProvidencia) {
            return res.status(404).json({
                error: 'No se encontró providencia para esta denuncia'
            });
        }

        res.json({ idProvidencia });

    } catch (error: any) {
        
        handlehttp(res, 'ERROR_GET_PROVIDENCIA_ID_BY_DENUNCIA', error);
    }
};

/**
 * Controlador para actualizar una providencia
 */
export const updateProvidencia = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const {
            articulos,
            suscrito,
            nombreSuscrito,
            cargoSuscrito,
            fechaSuscrito,
            institucionSuscrito,
            disposiciones,
            pdf_providencia
        } = req.body;
         const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)

        // Validar que el ID sea un número válido
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                error: 'ID de providencia inválido'
            });
        }

        const providenciaActualizada = await actualizarProvidencia(id, {
            articulos,
            suscrito,
            nombreSuscrito,
            cargoSuscrito,
            fechaSuscrito,
            institucionSuscrito,
            disposiciones,
            pdf_providencia
        },idUsuario,usuario,nombres,canton);

        if (!providenciaActualizada) {
            return res.status(404).json({
                error: 'Providencia no encontrada'
            });
        }

        res.json(providenciaActualizada);

    } catch (error: any) {
       
        handlehttp(res, 'ERROR_UPDATE_PROVIDENCIA', error);
    }
};


//----------------pdfs--------------------//
export const getProvidenciaPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    await crearPdfProvidenciaNNA(res, Number(id),idUsuario,usuario,nombres,canton);
   
  } catch (error) {
    handlehttp(res, 'get_error_pdf_providencia', error);
  }
};