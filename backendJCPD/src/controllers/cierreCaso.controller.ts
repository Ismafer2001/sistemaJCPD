import { Request, Response } from 'express';
import { crearCierreCaso, obtenerDatosParaCierreCaso } from '../services/cierreCaso.service';
import { handlehttp } from '../utils/error.handle';

// Controlador para crear un cierre de caso
export const postCrearCierreCaso = async (req: Request, res: Response) => {
    try {
        const { idDenuncia, codigoTramite, conclusion, secretariaAuxiliar, informesPresentados } = req.body;

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
        });

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