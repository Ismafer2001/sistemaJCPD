import { Request, Response } from "express";


import { handlehttp } from "../utils/error.handle";
import {
  citacionesDTO,
  crearcitacion,
  actualizarCitacion,
  obtenerCitacion,
  involucradosACitar,
  crearOtrosCitados,
  otrosACitar,
  eliminarOtrosCitados,
  actualizarOtrosCitados,
} from "../services/citaciones.service";
import { PDFcitacion } from "../services/pdfs/citacionespdf.service";

// Controlador para crear un registro en la tabla Otros
export const postCreateOtrosCitados = async (req: Request, res: Response) => {
  try {
    const { nombres, apellidos, cedula, parte, idDenuncia } = req.body;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombresUser = req.user.nombres
    const canton = String(req.user.canton)
    if (!nombres || !idDenuncia) {
      return res
        .status(400)
        .json({
          message: "Los campos nombres, idDenuncia y parte son requeridos",
        });
    }
    const nuevoOtro = await crearOtrosCitados(req.body,idUsuario,usuario,nombresUser,canton);
    res.status(201).json(nuevoOtro);
  } catch (error) {
    handlehttp(res, "error_post_otro_notificado", error);
  }
};

// Controlador para eliminar otros citados
export const deleteOtroCitado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    const resultado = await eliminarOtrosCitados(Number(id),idUsuario,usuario,nombres,canton);
    res.json(resultado);
  } catch (error) {
    handlehttp(res, 'error_delete_otro_citado', error);
  }
};

// Controlador para actualizar otros citados
export const putOtroCitado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    const otroActualizado = await actualizarOtrosCitados(Number(id), req.body,idUsuario,usuario,nombres,canton);
    res.json(otroActualizado);
  } catch (error) {
    handlehttp(res, 'error_put_otro_citado', error);
  }
};

// Controlador para actualizar una citación
export const putCitacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    const citacionActualizada = await actualizarCitacion(id, req.body,idUsuario,usuario,nombres,canton);
    res.json(citacionActualizada);
  } catch (error) {
    handlehttp(res, "error_put_citacion", error);
  }
};

// Controlador para obtener los datos de una citación
export const getCitacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = await obtenerCitacion(Number(id));
    res.json(datos);
  } catch (error) {
    handlehttp(res, "error_get_citacion", error);
  }
};

export const getPersonasCitacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const personas = await involucradosACitar(id);
    if (!Array.isArray(personas) || personas.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron personas notificadas" });
    }
    res.json(personas);
  } catch (error) {
    console.error("Error al consultar personas:", error);
    res.status(500).json({ message: "Error al consultar", error: error });
  }
};

export const getOtrosACitar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const personas = await otrosACitar(id);

    if (!personas) {
      return res.status(404).json({ message: "No se encontraron personas" });
    }

    res.json(personas);
  } catch (error) {
    handlehttp(res, "error_get_otros_a_notificar", error);
  }
};

export const getCitacionesDTO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipoInvolucrado, idInvolucrado, idCitacion } = req.query;
    

    const datos = await citacionesDTO(
      id,
      tipoInvolucrado as string,
      idInvolucrado as string,
      idCitacion as string,
    );

    console.log(datos);
    res.json(datos);
  } catch (error) {
    handlehttp(res, "error_get_datos", error);
  }
};

export const postCitacion = async (req: Request, res: Response) => {
  try {
    const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    const nuevacitacion = await crearcitacion(req.body,idUsuario,usuario,nombres,canton);
     
    res.status(201).json(nuevacitacion);
  } catch (error) {
    handlehttp(res, "error_post_citacion", error);
  }
};

//-----pdfs------------///

// Controlador para generar y enviar el PDF de citación
export const getCitacionPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
     const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    await PDFcitacion(res, id,idUsuario,usuario,nombres,canton);
  } catch (error) {
    handlehttp(res, "error_get_citacion_pdf", error);
  }
};
