import { Request, Response } from "express";
import {  Denuncia, Denunciado, Denunciante,  Otros, Avocatoria } from "../models";
import { notifiacionesDTO, personasNotificacion } from "../services/notificaciones.service";
import { handlehttp } from "../utils/error.handle";
import { citacionesDTO, crearcitacion, personasCitacion, actualizarCitacion, obtenerCitacion } from "../services/citaciones.service";
import { PDFcitacion } from '../services/pdfs/citacionespdf.service';



// Controlador para actualizar una citación
export const putCitacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const citacionActualizada = await actualizarCitacion(id, req.body);
    res.json(citacionActualizada);
  } catch (error) {
    handlehttp(res, 'error_put_citacion', error);
  }
};

// Controlador para obtener los datos de una citación
export const getCitacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = await obtenerCitacion(Number(id));
    res.json(datos);
  } catch (error) {
    handlehttp(res, 'error_get_citacion', error);
  }
};

 export const getPersonasCitacion = async (req:Request, res:Response) =>{
    try {
      const { id } = req.params;
      const personas = await personasCitacion(id);
      if (!Array.isArray(personas) || personas.length === 0) {
        return res.status(404).json({ message: 'No se encontraron personas notificadas' });
      }
      res.json(personas);
        
    } catch (error) {
        console.error('Error al consultar personas:', error);
  res.status(500).json({ message: 'Error al consultar', error: error });
        
    }


 }

 export const getCitacionesDTO = async(req:Request, res:Response) =>{
  try {
    const { id } = req.params;

  const datos = await citacionesDTO(id);
  
  
  console.log(datos)
  res.json(datos)
    
  } catch (error) {
    handlehttp(res,'error getDatos',error)
    
  }

  


 }

 export const postCitacion = async (req: Request, res: Response) => {
   try {
    const nuevacitacion = await crearcitacion(req.body);
        res.status(201).json(nuevacitacion);
    
   } catch (error) {
  
      handlehttp(res,'error_post_citacion',error)
    
   }
 }

 //-----pdfs------------///

// Controlador para generar y enviar el PDF de citación
export const getCitacionPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await PDFcitacion(res, id);
  } catch (error) {
    handlehttp(res, 'error_get_citacion_pdf', error);
  }
};