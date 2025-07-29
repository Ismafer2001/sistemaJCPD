import { Request, Response } from "express";
import {  Denuncia, Denunciado, Denunciante,  Otros, Avocatoria } from "../models";
import { notifiacionesDTO, personasNotificacion } from "../services/notificaciones.service";
import { handlehttp } from "../utils/error.handle";

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

 export const getNotificacionDTO = async(req:Request, res:Response) =>{
  try {
    const { id } = req.params;

  const datos = await notifiacionesDTO(id);
  
  
  console.log(datos)
  res.json(datos)
    
  } catch (error) {
    handlehttp(res,'error getDatos',error)
    
  }

  


 }

/*export const getdenunciaParaNotificacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const denuncia = await Denuncia.findByPk(id, {
      attributes: ['codigo_tramite', 'fecha_creacion'],
      include: [
        {
          model: NotificacionInvolucrado,
          as: 'notificados',
          attributes: ['nombres']
        },
        {
          model: Avocatoria,
          
          attributes: ['id', 'fechaCreado']
        }
      ]
    }) as any;

    if (!denuncia) {
      return res.status(404).json({ message: 'No se encontró la denuncia' });
    }

    const resultado = {
      codigo_tramite: denuncia.codigo_tramite,
      fecha_creacion: denuncia.fecha_creacion,
      avocatoria: denuncia.avocatoria ? {
        id: denuncia.avocatoria.id,
        fecha_avocatoria: denuncia.avocatoria.fecha_avocatoria,
        detalle: denuncia.avocatoria.detalle
      } : null,
      notificados: (denuncia.notificados || []).map((n: NotificacionInvolucrado) => n.nombres)
    };

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar la denuncia para notificación:', error);
    res.status(500).json({ message: 'Error al consultar la denuncia', error });
  }
};
*/