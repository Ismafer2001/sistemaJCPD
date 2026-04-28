
import { Request, Response } from 'express';
import { Denuncia,  Afectado, } from '../models';
import { insertDenuncia,
         
         obtenerNumTramite,
         countDenuncias,
         eliminarDenuncia,
         obtenertodasLasDenuncias,
         getDenunciaCompleta,
         actualizarDenuncia } from '../services/denuncia.service';
import { crearPdfDenunciaNNA } from '../services/pdfs/denunciapdf.service.ts.service';
import { handlehttp } from '../utils/error.handle';
import { datosDenuncia } from '../interfaces/denuncia.interface';

//---------------CONTROLADOR GLOBAL DE GRUPOS PRIORITARIOS-------------//

// Obtener todas las denuncias
export const getAllDenuncias = async (req: Request, res: Response) => {
  try {
    // Parámetros de paginación, grupoPrioritario y búsqueda desde query
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const grupoPrioritario = req.query.grupoPrioritario as string;
    const search = req.query.search as string; // Valor a buscar
    const searchBy = req.query.searchBy as 'codigoTramite' | 'nombre' | 'cedula'; // Tipo de búsqueda
    const id_canton = Number((req.user as any).id_canton);
    
    if (!id_canton || Number.isNaN(id_canton)) {
      return res.status(400).json({ error: 'ID de cantón inválido' });
    }

    const resultado = await obtenertodasLasDenuncias({ 
      page, 
      limit, 
      grupoPrioritario, 
      id_canton,
      search, // Valor a buscar
      searchBy // Tipo de búsqueda
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener denuncias:', error);
    res.status(500).json({ message: 'Error al obtener las denuncias' });
  }
};

export const getDenunciaCompletaCtrl = async (req: Request, res: Response) => {
  try {
    const idDenuncia = Number(req.params.id);
    if (!idDenuncia || Number.isNaN(idDenuncia)) {
      return res.status(400).json({ error: 'ID de denuncia inválido' });
    }
    console.log("aqui el id",idDenuncia)
    const resultado = await getDenunciaCompleta(idDenuncia);
    
    res.json(resultado);
  } catch (error) {
    handlehttp(res, 'ERROR_AL_OBTENER_DENUNCIA_COMPLETA', error);
  }
}

// Obtener una denuncia por ID
export const getDenunciaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const denuncia = await Denuncia.findByPk(id, {
      include:  [
        {
          model: Afectado,
          as:'afectados',
          
          attributes: ['nombres', 'apellidos','cedula']
        }
      ]
    });
    // Transformamos la respuesta al formato deseado
    const resultado = {
  codigoTramite: denuncia?.codigoTramite,
  fecha: denuncia?.fechaCreado,
  idDenuncia: denuncia?.id,
  afectados: (denuncia as any).afectados.map((a: any) => `${a.nombres} ${a.apellidos}`),
  cedulasAfectados: (denuncia as any).afectados.map((a: any) => a.cedula)
};


    if (!resultado) {
      res.status(404).json({ message: 'Denuncia no encontrada' });
      return;
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener la denuncia:', error);
    res.status(500).json({ message: 'Error al obtener la denuncia' });
  }
};

//controlador para automatizar el codigo unico del tramite
export const getObtenerNumeroTramite = async (req:Request, res:Response) => {
  try {
    const id_canton= Number(req.user.id_canton)
    const { incrementar } = req.query;// viene como string
    const grupoPrioritario = req.query.grupoPrioritario;
    
     if (typeof grupoPrioritario !== 'string') {
  return res.status(400).json({ error: 'grupoPrioritario debe ser un string' });
}

    const numero = await obtenerNumTramite({
      incrementar: incrementar === 'true'
    }, id_canton,grupoPrioritario);

    res.json({ numero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener número de trámite' });
  }
};
//controlador para contar denuncias activas
export const getTotalDenunciaActivasController =async(req:Request, res:Response) =>{
   try {
   const id_canton = Number((req.user as any).id_canton);
  const grupoPrioritario = req.query.grupoPrioritario;
   
   if (typeof grupoPrioritario !== 'string') {
  return res.status(400).json({ error: 'grupoPrioritario debe ser un string' });
}

    
    
    // viene como string
    const total = await countDenuncias(id_canton,grupoPrioritario);

    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener número de trámite' });
  }

}

export async function putDenuncia(req: Request, res: Response) {
  try {
    const idDenuncia = Number(req.params.id);
    const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
   const payload: datosDenuncia = {
      denuncia: req.body,
      denunciante: req.body.denunciante,
      denunciados: req.body.denunciados,
      afectados: req.body.afectados,
      vulneraciones: req.body.vulneraciones,
      medidas: req.body.medidas

    };
    const result = await actualizarDenuncia(idDenuncia, payload,idUsuario,usuario,nombres,canton);
    res.json(result);
  } catch (error) {
   handlehttp(res, 'ERROR_AL_ACTUALIZAR_DENUNCIA', error);
  }
}

//--------------------CONTROLADOOR DENUNCIA NNA---------------------------------//

//crear denuncia controller
export const postCrearDenuncia = async (req: Request, res: Response): Promise<void> => {
  try {
    // Construir el payload tipado para el servicio
    const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    const payload: datosDenuncia = {
      denuncia: req.body,
      denunciante: req.body.denunciante,
      denunciados: req.body.denunciados,
      afectados: req.body.afectados,
      vulneraciones: req.body.vulneraciones,
      medidas: req.body.medidas

    };

    // Llamar al servicio que inserta la denuncia
    const nuevaDenuncia = await insertDenuncia(payload,idUsuario,usuario,nombres,canton);

    // Responder al cliente con el ID de la nueva denuncia
    res.status(201).json({
      success: true,
      message: 'Denuncia creada exitosamente',
      data: { id: nuevaDenuncia.id }
    });
  } catch (error) {
    handlehttp(res, 'ERROR_EN_SERVIDOR',error);
    // Manejo de errores genérico
    
  }
};

//eliminar denuncia controller
export const deleteDenuncia = async (req:Request, res:Response) =>{
  try {
    const {id} =req.params
    
    await eliminarDenuncia(id)
    res.json({ mensaje: "denuncia eliminado definitivamente" });

    
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar denuncia", error });
    console.log(error)
  }
    
  
}

//-------------------controlador pdf--------------------//

// crear pdf denuncia nna POST
export const getCrearPdfDenuncia = async (req: Request, res: Response) => {
  try {
    // Validación mínima: aseguramos que haya algún contenido en el body
    const { id } = req.params;
    const idUsuario =req.user.id
    
    const  usuario = req.user.usuario
    const nombres = req.user.nombres
    const canton = String(req.user.canton)
    console.log("ID Denuncia:", id); // Línea de depuración

    // La función escribe directamente en `res` (stream PDF)
    
      await crearPdfDenunciaNNA(res, id, idUsuario,usuario,nombres,canton);
      
    
  } catch (error) {
    console.error('postCrearPdfDenuncia error:', error);
    handlehttp(res, 'ERROR_post.pdf', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al generar PDF' });
    }
  }
};
