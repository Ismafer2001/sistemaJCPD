import { Request, Response } from "express";
import {  Otros } from "../models";
import { crearNotificacion, crearOtrosNotificados, notifiacionesDTO, personasNotificacion, obtenerDatosNotificacion, actualizarNotificacion } from "../services/notificaciones.service";

import { PDFnotificacion } from '../services/pdfs/notificacionpdf.service';
import { handlehttp } from "../utils/error.handle";


// Controlador para crear un registro en la tabla Otros
export const postCreateOtro = async (req: Request, res: Response) => {
  try {
    const {
    nombres,
    apellidos,
    cedula,
    parte,
    idDenuncia} = req.body;
    if (!nombres || !idDenuncia || !parte) {
      return res.status(400).json({ message: 'Los campos nombres, idDenuncia y parte son requeridos' });
    }
    const nuevoOtro = await crearOtrosNotificados(req.body);
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

res.json(personas);
        
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
   // Agregás un nuevo valor a la instancia

      res.status(201).json(nuevaNotificacion);
      
  
 } catch (error) {

    handlehttp(res,'error_post_notificacion',error)
  
 }

 }

 // Controlador para obtener los datos de una notificación por id
export const getNotificacionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = await obtenerDatosNotificacion(Number(id));
    res.json(datos);
  } catch (error) {
    handlehttp(res, 'error_get_notificacion_by_id', error);
  }
};

// Controlador para generar y enviar el PDF de notificación
export const getNotificacionPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await PDFnotificacion(res, Number(id));
  } catch (error) {
    handlehttp(res, 'error_get_notificacion_pdf', error);
  }
};


// Controlador para actualizar una notificación
export const putNotificacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notificacionActualizada = await actualizarNotificacion(Number(id), req.body);
    res.json(notificacionActualizada);
  } catch (error) {
    handlehttp(res, 'error_put_notificacion', error);
  }
};

