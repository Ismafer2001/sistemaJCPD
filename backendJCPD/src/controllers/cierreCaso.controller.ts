import { Request, Response } from 'express';
import { crearCierreCaso, obtenerDatosParaCierreCaso, obtenerDatosCierreCasoCompleto, actualizarCierreCaso } from '../services/cierreCaso.service';
import { handlehttp } from '../utils/error.handle';
import { crearPdfCierreCaso } from '../services/pdfs/cierreCasoPdf.service';

// Controlador para crear un cierre de caso
export const postCrearCierreCaso = async (req: Request, res: Response) => {
    try {
        const { idDenuncia, codigoTramite, conclusion, secretariaAuxiliar, informesPresentados } = req.body;
         const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)

        // Validar que los campos requeridos estén presentes
        if (!idDenuncia || !codigoTramite || !conclusion || !secretariaAuxiliar) {
            return res.status(400).json({
                success: false,
                message: 'Los campos idDenuncia, codigoTramite, conclusion y secretariaAuxiliar son obligatorios'
            });
        }

        // Validar que informesPresentados sea un array y tenga al menos un elemento
        if (!informesPresentados || !Array.isArray(informesPresentados) || informesPresentados.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere al menos un informe presentado'
            });
        }

        // Validar que cada informe tenga los campos requeridos
        for (const informe of informesPresentados) {
            if (!informe.informe || !informe.nombreTecnico || !informe.lugar || !informe.personaEvaluada) {
                return res.status(400).json({
                    success: false,
                    message: 'Cada informe debe tener los campos: informe, nombreTecnico, lugar y personaEvaluada'
                });
            }
        }

        // Crear el cierre de caso
        const cierreCaso = await crearCierreCaso({
            idDenuncia,
            codigoTramite,
            conclusion,
            secretariaAuxiliar,
            informesPresentados
        },idUsuario,usuario,nombres,canton);

        res.status(201).json({
            success: true,
            message: 'Cierre de caso creado exitosamente',
            data: cierreCaso
        });

    } catch (error) {
        console.error('Error al crear cierre de caso:', error);
        handlehttp(res, 'error_crear_cierre_caso', error);
    }
};

// Controlador para obtener datos necesarios para el cierre de caso
export const getDatosParaCierreCaso = async (req: Request, res: Response) => {
    try {
        const idDenuncia = parseInt(req.params.id);

        if (!idDenuncia || isNaN(idDenuncia)) {
            return res.status(400).json({
                success: false,
                message: 'ID de denuncia inválido'
            });
        }

        const datos = await obtenerDatosParaCierreCaso(idDenuncia);

        res.json(datos);

    } catch (error) {
        console.error('Error al obtener datos para cierre de caso:', error);
        handlehttp(res, 'error_obtener_datos_cierre_caso', error);
    }
};

// Controlador para obtener los datos del cierre de caso con sus informes presentados
export const getDatosCierreCasoCompleto = async (req: Request, res: Response) => {
    try {
        const idCierreCaso = parseInt(req.params.id);

        if (!idCierreCaso || isNaN(idCierreCaso)) {
            return res.status(400).json({
                success: false,
                message: 'ID de cierre de caso inválido'
            });
        }

        const datos = await obtenerDatosCierreCasoCompleto(idCierreCaso);

        res.status(200).json(datos);

    } catch (error) {
        console.error('Error al obtener datos del cierre de caso:', error);
        
        handlehttp(res, 'error_obtener_cierre_caso', error);
    }
};

// Controlador para actualizar un cierre de caso
export const putActualizarCierreCaso = async (req: Request, res: Response) => {
    try {
        const idCierreCaso = parseInt(req.params.id);
        const { codigoTramite, conclusion, secretariaAuxiliar, informesPresentados, estatus } = req.body;
         const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)

        if (!idCierreCaso || isNaN(idCierreCaso)) {
            return res.status(400).json({
                success: false,
                message: 'ID de cierre de caso inválido'
            });
        }

        // Validar que los campos requeridos estén presentes
        if (!codigoTramite || !conclusion || !secretariaAuxiliar) {
            return res.status(400).json({
                success: false,
                message: 'Los campos codigoTramite, conclusion y secretariaAuxiliar son obligatorios'
            });
        }

        // Validar que informesPresentados sea un array y tenga al menos un elemento
        if (!informesPresentados || !Array.isArray(informesPresentados) || informesPresentados.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere al menos un informe presentado'
            });
        }

        // Validar que cada informe tenga los campos requeridos
        for (const informe of informesPresentados) {
            if (!informe.informe || !informe.nombreTecnico || !informe.lugar || !informe.personaEvaluada) {
                return res.status(400).json({
                    success: false,
                    message: 'Cada informe debe tener los campos: informe, nombreTecnico, lugar y personaEvaluada'
                });
            }
        }

        // Actualizar el cierre de caso
        const cierreCasoActualizado = await actualizarCierreCaso(idCierreCaso, {
            idDenuncia: 0, // No se actualiza, solo se necesita para la interface
            codigoTramite,
            conclusion,
            secretariaAuxiliar,
            informesPresentados,
            estatus
        },idUsuario,usuario,nombres,canton);

        res.status(200).json({
            success: true,
            message: 'Cierre de caso actualizado exitosamente',
            data: cierreCasoActualizado
        });

    } catch (error) {
        console.error('Error al actualizar cierre de caso:', error);
        
        handlehttp(res, 'error_actualizar_cierre_caso', error);
    }
};

export const getCierreCasoPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    await crearPdfCierreCaso(res, Number(id),idUsuario,usuario,nombres,canton);
   
  } catch (error) {
    handlehttp(res, 'get_error_pdf_avocatoria', error);
  }
};