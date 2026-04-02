import { Request, Response } from "express";
import {
	crearAudienciaPruebas,
	actualizarAudienciaPruebas,
	AudienciaPruebasDTO,
	getParticipantesAudienciaContestacion,
	AgregarOtrosParticipantes,
	
	vulneracionesPorAfectado,
	agregarVulneracionIdentificada,
	eliminarVulneracionIdentificada,
	actualizarVulneracionIdentificada,
	crearAudienciaPruebasConArchivos,
	actualizarAudienciaPruebasConArchivos
} from '../services/audienciaPrueba.service';

import { handlehttp } from "../utils/error.handle";

// Crear audiencia de pruebas
export const postAudienciaPruebas = async (req: Request, res: Response) => {
	try {
		const result = await crearAudienciaPruebas(req.body);
		res.status(201).json(result);
	} catch (error) {
		handlehttp(res,'Error al crear audiencia de pruebas' , error);
	}
}; 


// Crear audiencia de pruebas CON archivos específicos por abogado
export const postAudienciaPruebasConArchivooosejemploborrar = async (req: Request, res: Response) => {
	try {
		console.log('Files recibidos:', req.files);
		console.log('Body recibido:', req.body.data);
		
		const files = req.files as Express.Multer.File[];
		const data = JSON.parse(req.body.data); // Los datos JSON vienen en req.body.data cuando se usa FormData
		
		const result = await crearAudienciaPruebasConArchivos(data, files);
		res.status(201).json(result);
	} catch (error) {
		console.error('Error en postAudienciaPruebasConArchivos:', error);
		handlehttp(res,'Error al crear audiencia de pruebas con archivos' , error);
	}
}; 
export const postAudienciaPruebasConArchivos = async (req: Request, res: Response) => {
    try {
        console.log('Files recibidos:', req.files);
        
        // 1. Red de seguridad: Si no envían ningún archivo, files será un arreglo vacío en lugar de undefined
        const files = (req.files as Express.Multer.File[]) || []; 
        
        // 2. Validar que realmente enviaron la propiedad 'data'
        if (!req.body.data) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se enviaron los datos de la audiencia (req.body.data es requerido)' 
            });
        }

        // 3. Proteger el servidor en caso de que el frontend envíe un JSON mal formado
        let data;
        try {
            data = JSON.parse(req.body.data);
        } catch (parseError) {
            return res.status(400).json({ 
                success: false, 
                message: 'El formato de los datos no es un JSON válido' 
            });
        }
        
        // 4. Ejecutar el servicio híbrido que armamos
        const result = await crearAudienciaPruebasConArchivos(data, files);
        
        res.status(201).json(result);

    } catch (error) {
        console.error('Error en postAudienciaPruebasConArchivos:', error);
        handlehttp(res, 'Error al crear audiencia de pruebas con archivos', error);
    }
};

// Actualizar audiencia de pruebas
export const putAudienciaPruebas = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await actualizarAudienciaPruebas(Number(id), req.body);
		res.json(result);
	} catch (error) {
		handlehttp(res,'Error al actualizar audiencia de pruebas' , error);
	}
};

// Actualizar audiencia de pruebas CON archivos específicos por abogado
export const putAudienciaPruebasConArchivos = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // 1. Validación de seguridad: Asegurarnos de que el ID sea un número válido
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ 
                success: false, 
                message: 'El ID de la audiencia proporcionado no es válido' 
            });
        }

        // 2. Extraer archivos (con fallback a arreglo vacío si no mandan archivos nuevos)
        const files = (req.files as Express.Multer.File[]) || [];
        
        // 3. Extraer y parsear datos de forma segura
        let data;
        if (!req.body.data) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se enviaron los datos de la audiencia (req.body.data)' 
            });
        }

        if (typeof req.body.data === 'string') {
            data = JSON.parse(req.body.data);
        } else {
            data = req.body.data;
        }
        
        // 4. Ejecutar el servicio
        const result = await actualizarAudienciaPruebasConArchivos(Number(id), data, files);
        
        // Usamos 200 OK para actualizaciones exitosas
        res.status(200).json(result);

    } catch (error) {
        console.error('Error en putAudienciaPruebasConArchivos:', error);
        handlehttp(res, 'Error al actualizar audiencia de pruebas con archivos', error);
    }
};

// Obtener DTO de audiencia de pruebas
export const getAudienciaPruebasDTO = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const datos = await AudienciaPruebasDTO(id);
		res.json(datos);
	} catch (error) {
		handlehttp(res,'Error al obtener DTO de audiencia de pruebas' , error);
	}
};

// Obtener participantes de audiencia de contestación (solo nombres, cedula, tipo_involucrado, no representantes)
export const getParticipantesAudienciaContestacionCtrl = async (req: Request, res: Response) => {
	try {
		const { idDenuncia } = req.params;
		const participantes = await getParticipantesAudienciaContestacion(Number(idDenuncia));
		res.json(participantes);
	} catch (error) {
		handlehttp(res,'Error al obtener participantes' , error);
	}
};

// Agregar otros participantes
export const postAgregarOtrosParticipantes = async (req: Request, res: Response) => {
	try {
		const result = await AgregarOtrosParticipantes(req.body);
		res.status(201).json(result);
	} catch (error) {
		handlehttp(res,'Error al añadir participante' , error);
	}
};


export const getVulneracionesPorAfectado = async (req: Request, res: Response) => {
	try {
		const id = parseInt(req.params.id);
		  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

		  const afectado = await vulneracionesPorAfectado(id);

		  res.json(
			afectado
		  );

		
	} catch (error) {
		handlehttp(res,'Error al obtener vulneraciones identificadas por afectado' , error);
		
	}

};
// Agregar vulneración identificada
export const postVulneracionIdentificada = async (req: Request, res: Response) => {
	try {
		const result = await agregarVulneracionIdentificada(req.body);
		res.status(201).json(result);
	} catch (error) {
		handlehttp(res, 'Error al agregar vulneración identificada', error);
	}
};

// Eliminar vulneración identificada
export const deleteVulneracionIdentificada = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		const result = await eliminarVulneracionIdentificada(id);
		res.json(result);
	} catch (error) {
		handlehttp(res, 'Error al eliminar vulneración identificada', error);
	}
};

// Actualizar vulneración identificada
export const putVulneracionIdentificada = async (req: Request, res: Response) => {
	try {
		const id = Number(req.params.id);
		const result = await actualizarVulneracionIdentificada(id, req.body);
		res.json(result);
	} catch (error) {
		handlehttp(res, 'Error al actualizar vulneración identificada', error);
	}
};

// Obtener todos los datos completos de una audiencia de pruebas
import { obtenerAudienciaPruebasCompleta } from '../services/audienciaPrueba.service';
import { crearPdfAudienciaPruebasNNA } from "../services/pdfs/audienciaPruebaspdf.service";

export const getAudienciaPruebasCompleta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const datos = await obtenerAudienciaPruebasCompleta(Number(id));
        res.json(datos);
    } catch (error) {
        handlehttp(res, 'Error al obtener datos completos de la audiencia de pruebas', error);
    }
};

//----------------pdfs--------------------//
export const getAudienciaPruebasPdf = async (req: Request, res: Response) => {
  try {
	const { id } = req.params;
	await crearPdfAudienciaPruebasNNA(res, Number(id));
   
  } catch (error) {
	handlehttp(res, 'get_error_pdf_audiencia', error);
  }
};


