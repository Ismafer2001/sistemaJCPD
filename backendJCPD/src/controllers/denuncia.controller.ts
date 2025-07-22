import { Request, Response, RequestHandler } from 'express';
import { Denuncia, Denunciante, Denunciado, Afectado, Vulneracion, VulneracionesIdentificadas, medidasIdentificadas, medida } from '../models';


import { insertDenuncia, datosDenuncia,  obtenerNumTramite,  countDenuncias, eliminarDenuncia } from '../services/denuncia.service';

export const crearDenuncia = async (req: Request, res: Response): Promise<void> => {
  try {
    // Construir el payload tipado para el servicio
    const payload: datosDenuncia = {
      denuncia: req.body,
      denunciante: req.body.denunciante,
      denunciados: req.body.denunciados,
      afectados: req.body.afectados,
      vulneracion: req.body.vulneraciones,
      medida: req.body.medidas
      

    };

    // Llamar al servicio que inserta la denuncia
    const nuevaDenuncia = await insertDenuncia(payload);

    // Responder al cliente con el ID de la nueva denuncia
    res.status(201).json({
      success: true,
      message: 'Denuncia creada exitosamente',
      data: { id: nuevaDenuncia.id }
    });
  } catch (error) {
    console.error('Error en crearDenuncia:', error);
    // Manejo de errores genérico
    res.status(500).json({
      success: false,
      message: 'Error al crear la denuncia',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deleteDenuncia = async (req:Request, res:Response) =>{
  try {
    const {id} =req.params
    console.log(id)
    await eliminarDenuncia(id)
    res.json({ mensaje: "denuncia eliminado definitivamente" });

    
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar denuncia", error });
    console.log(error)
  }
    
  
}

// Obtener todas las denuncias
export const getAllDenuncias = async (req: Request, res: Response) => {
   try {
    const denuncias = await Denuncia.findAll({
      include: [
        {
          model: Afectado,
          as: 'afectados',
          attributes: ['nombres', 'apellidos','cedula']
        }
      ]
    });

    // Transformamos la respuesta al formato deseado
    const resultado = denuncias.map(denuncia => ({
  codigoTramite: denuncia.codigoTramite,
  fecha: denuncia.fecha_creado,
  idDenuncia: denuncia.id,
  afectados: (denuncia as any).afectados.map((a: any) => `${a.nombres} ${a.apellidos}`),
  cedulasAfectados: (denuncia as any).afectados.map((a: any) => a.cedula)
}));

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener denuncias:', error);
    res.status(500).json({ message: 'Error al obtener las denuncias' });
  }
};

// Obtener una denuncia por ID
export const getDenunciaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const denuncia = await Denuncia.findByPk(id, {
      include:  [
        {
          model: Afectado,
          as: 'afectados',
          attributes: ['nombres', 'apellidos','cedula']
        }
      ]
    });
    // Transformamos la respuesta al formato deseado
    const resultado = {
  codigoTramite: denuncia?.codigoTramite,
  fecha: denuncia?.fecha_creado,
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



export const obtenerNumeroTramite = async (req:Request, res:Response) => {
  try {
    const { incrementar } = req.query; // viene como string
    const numero = await obtenerNumTramite({
      incrementar: incrementar === 'true',
    });

    res.json({ numero });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener número de trámite' });
  }
};
export const totalDenunciaActivasController =async(req:Request, res:Response) =>{
   try {
    // viene como string
    const total = await countDenuncias();

    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener número de trámite' });
  }

}
