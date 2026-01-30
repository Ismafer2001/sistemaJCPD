import { Request, Response } from "express";
import {  Otros } from "../models";
import { crearNotificacion,
   crearOtrosNotificados,
    notifiacionesDTO,
      obtenerDatosNotificacion,
       actualizarNotificacion,
        involucradosANotificacion, 
        otrosANotificacion,
        eliminarOtrosNotificados,
        actualizarOtrosNotificados} from "../services/notificaciones.service";

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
    if (!nombres || !idDenuncia) {
      return res.status(400).json({ message: 'Los campos nombres, idDenuncia y parte son requeridos' });
    }
    const nuevoOtro = await crearOtrosNotificados(req.body);
    res.status(201).json(nuevoOtro);
  } catch (error) {
    handlehttp(res,'error_post_otro_notificado',error)
  }
};
// Controlador para eliminar otros notificados
export const deleteOtroNotificado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await eliminarOtrosNotificados(Number(id));
    res.json(resultado);
  } catch (error) {
    handlehttp(res, 'error_delete_otro_notificado', error);
  }
};

// Controlador para actualizar otros notificados
export const putOtroNotificado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const otroActualizado = await actualizarOtrosNotificados(Number(id), req.body);
    res.json(otroActualizado);
  } catch (error) {
    handlehttp(res, 'error_put_otro_notificado', error);
  }
};

 export const getInvolucradosANotificar = async (req:Request, res:Response) =>{
    try {
      const { id } = req.params;


        const personas = await involucradosANotificacion(id)

if (!personas) {
  return res.status(404).json({ message: 'No se encontraron personas' });
}

res.json(personas);
        
    } catch (error) {
    handlehttp(res,'error_get_otros_a_notificar',error)
        
    }


 }
  export const getOtrosANotificar = async (req:Request, res:Response) =>{
    try {
      const { id } = req.params;


        const personas = await otrosANotificacion(id)

if (!personas) {
  return res.status(404).json({ message: 'No se encontraron personas' });
}

res.json(personas);
        
    } catch (error) {
     handlehttp(res,'error_get_otros_a_notificar',error)
        
    }


 }

export const getNotificacionDTO = async(req:Request, res:Response) =>{
  try {
    const { id } = req.params;
    const { tipoInvolucrado, idInvolucrado,idNotificacion } = req.query;
    
    console.log("Parametros recibidos:", { id, tipoInvolucrado, idInvolucrado, idNotificacion });

    // Si se proporcionan parámetros, validar que ambos estén presentes
    if ((tipoInvolucrado && !idInvolucrado) || (!tipoInvolucrado && idInvolucrado)) {
      return res.status(400).json({ 
        message: 'Si proporcionas tipoInvolucrado, también debes proporcionar idInvolucrado (y viceversa)',
        parametrosRecibidos: { tipoInvolucrado, idInvolucrado }
      });
    }

    const datos = await notifiacionesDTO(id, tipoInvolucrado as string, idInvolucrado as string, idNotificacion as string);
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



