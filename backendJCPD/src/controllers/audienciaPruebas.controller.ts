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
	actualizarVulneracionIdentificada
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


