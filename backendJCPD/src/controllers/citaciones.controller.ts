
import { Request, Response } from "express";
import {  Denuncia, Denunciado, Denunciante,  Otros, Avocatoria } from "../models";
import { notifiacionesDTO, personasNotificacion } from "../services/notificaciones.service";
import { handlehttp } from "../utils/error.handle";
import { citacionesDTO, crearcitacion, personasCitacion } from "../services/citaciones.service";

 export const getPersonasCitacion = async (req:Request, res:Response) =>{
    try {
      const { id } = req.params;


        const personas = await personasCitacion(id)

if (!personas) {
  return res.status(404).json({ message: 'No se encontraron personas' });
}
console.log(personas)
const resultado: { nombres: string }[] = [
  ...(personas?.Denunciantes || []).map(d => ({ nombres: d.nombres || '',parte:'accionante'})),
  ...(personas?.Denunciados || []).map(d => ({ nombres: d.nombres || '',parte:'accionado' })),

  ...(personas?.otros || []).map(n => ({ nombres: n.nombres || '',parte:n.parte }))
].filter(p => p.nombres); // elimina los vacíos




res.json(resultado);
        
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