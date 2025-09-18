import { Request, Response } from 'express';
import { AgregarOtrosParticipantes, AgregarRepresentantesInstitucionales, AudiencaContestacionDTO, getAfectadosYDirigidoA, ObtenerRepresentantesInstitucionales } from '../services/aucienciaContestacion.service';
import { handlehttp } from '../utils/error.handle';


//-------------METODOS GET------------------//
//get personasParticipantes
export const getAfectadosYDirigidoAController = async (req: Request, res: Response) => {
  try {
    const idDenuncia = Number(req.params.idDenuncia);
    if (isNaN(idDenuncia)) {
      return res.status(400).json({ error: 'idDenuncia inválido' });
    }
    const resultado = await getAfectadosYDirigidoA(idDenuncia);
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener afectados y dirigidoA:', error);
    res.status(500).json({ error: 'Error al obtener datos', details: error });
  }
};
//get represntantes
export const getRepresentantesInstitucionalesController = async (req: Request, res: Response) => {
  try {
    const idDenuncia = Number(req.params.idDenuncia);
    if (isNaN(idDenuncia)) {
      return res.status(400).json({ error: 'idDenuncia inválido' });
    }
    const resultado = await ObtenerRepresentantesInstitucionales(idDenuncia);
    res.json(resultado);
  } catch (error) {
    handlehttp(res,'Error al obtener representantes institucionales' , error);
  }
};
//get datos para audiencia
export const getDatosAudienciaController = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
   
    const resultado = await AudiencaContestacionDTO(id);
    res.json(resultado);
  } catch (error) {
    handlehttp(res,'Error al obtener datos para la audiencia' , error);
  }
};

//-------------METODOS POST------------------//
//post particpanntes
export const postaniadirParticipante = async (req: Request, res: Response) => {
  try {
    const nuevoParticipante = await AgregarOtrosParticipantes(req.body);
    res.status(201).json(nuevoParticipante);
  } catch (error) {
    handlehttp(res,'Error al añadir participante' , error);
  }
}
//post representantes
export const postaniadirRepresentante = async (req: Request, res: Response) => {
  try {
    const nuevoRepresentante = await AgregarRepresentantesInstitucionales(req.body);
    res.status(201).json(nuevoRepresentante);
  } catch (error) {
    handlehttp(res,'Error al añadir representante' , error);
  }
}