import { actualizarAudienciaContestacion } from '../services/aucienciaContestacion.service';
import { crearAudienciaContestacion, obtenerAudienciaContestacionCompleta } from '../services/aucienciaContestacion.service';
import { Request, Response } from 'express';
import { AgregarOtrosParticipantes,  AudiencaContestacionDTO, getAfectadosYDirigidoA,  } from '../services/aucienciaContestacion.service';
import { handlehttp } from '../utils/error.handle';
import { crearPdfAudienciaContestacionNNA } from '../services/pdfs/audienciaContestacionpdf.service';


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
// Controlador para obtener todos los datos relacionados con la audiencia de contestación
export const getAudienciaContestacionCompleta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = await obtenerAudienciaContestacionCompleta(Number(id));
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener audiencia de contestación', error });
  }
};

//-------------METODOS POST------------------//
//post particpanntes
export const postaniadirParticipante = async (req: Request, res: Response) => {
  try {
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    const nuevoParticipante = await AgregarOtrosParticipantes(req.body,idUsuario,usuario,nombres,canton);
    res.status(201).json(nuevoParticipante);
  } catch (error) {
    handlehttp(res,'Error al añadir participante' , error);
  }
}

// Controlador para crear audiencia de contestación
export const postAudienciaContestacion = async (req: Request, res: Response) => {
  try {
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    const result = await crearAudienciaContestacion(req.body,idUsuario,usuario,nombres,canton);
    res.status(201).json(result);
  } catch (error) {
    handlehttp(res, 'error_post_crear_audiencia_contestacion', error);
  }
};

//--------------------METODOS PUT--------------------//

export const putAudienciaContestacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    console.log("ID recibido en el controlador:", id);
    const result = await actualizarAudienciaContestacion(Number(id), req.body,idUsuario,usuario,nombres,canton);
    res.json(result);
  } catch (error) {
    handlehttp(res, 'ERROR_AL_ACTUALIZAR_AUDIENCIA_CONTESTACION', error);
  }
};

//----------------pdfs--------------------//
export const getAudienciaContestacionPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    await crearPdfAudienciaContestacionNNA(res, Number(id),idUsuario,usuario,nombres,canton);
   
  } catch (error) {
    handlehttp(res, 'get_error_pdf_audiencia', error);
  }
};
