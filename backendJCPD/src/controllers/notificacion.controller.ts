import { Request, Response } from "express";
import {  Denuncia, Denunciado, Denunciante,  Otros, Avocatoria } from "../models";
import { crearNotificacion, notifiacionesDTO, personasNotificacion } from "../services/notificaciones.service";
import { handlehttp } from "../utils/error.handle";
import { PDFnotificacion } from "../services/pdfs/notificacionpdf.service";

// Controlador para crear un registro en la tabla Otros
export const createOtro = async (req: Request, res: Response) => {
  try {
    const { nombres, idDenuncia, parte } = req.body;
    if (!nombres || !idDenuncia || !parte) {
      return res.status(400).json({ message: 'Los campos nombres, idDenuncia y parte son requeridos' });
    }
    const nuevoOtro = await Otros.create({ nombres, idDenuncia, parte });
    res.status(201).json(nuevoOtro);
  } catch (error) {
    console.error('Error al crear registro en Otros:', error);
    res.status(500).json({ message: 'Error al crear registro', error });
  }
};

 export const getPersonasNotificar = async (req:Request, res:Response) =>{
    try {
      const { id } = req.params;


        const personas = await personasNotificacion(id)

if (!personas) {
  return res.status(404).json({ message: 'No se encontraron personas' });
}

const resultado: { nombres: string }[] = [
  ...(personas?.Denunciantes || []).map(d => ({ nombres: d.nombres || '',parte:'Accionante'})),
  ...(personas?.Denunciados || []).map(d => ({ nombres: d.nombres || '',parte:'Accionado' })),

  ...(personas?.otros || []).map(n => ({ nombres: n.nombres || '',parte:n.parte }))
].filter(p => p.nombres); // elimina los vacíos




res.json(resultado);
        
    } catch (error) {
        console.error('Error al consultar personas:', error);
  res.status(500).json({ message: 'Error al consultar', error: error });
        
    }


 }

 export const getNotificacionDTO = async(req:Request, res:Response) =>{
  try {
    const { id } = req.params;

  const datos = await notifiacionesDTO(id);
  
  
  
  
  
  res.json(datos)
    
  } catch (error) {
    handlehttp(res,'error getDatos',error)
    
  }

  


 }

 export const postNotificacion = async (req: Request, res: Response) => {
 try {
  const nuevaNotificacion = await crearNotificacion(req.body);
  const pdfPath = await PDFnotificacion(nuevaNotificacion);
  nuevaNotificacion.datosGenerales = pdfPath; // Agregás un nuevo valor a la instancia
await nuevaNotificacion.save();
      res.status(201).json(nuevaNotificacion);
      
  
 } catch (error) {

    handlehttp(res,'error_post_notificacion',error)
  
 }

 }

