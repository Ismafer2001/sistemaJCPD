import { Request, Response } from 'express';
import { Denuncia, Denunciante, Denunciado, Afectado, Vulneracion, VulneracionesIdentificadas, medidasIdentificadas, medida } from '../models';
import jwt from 'jsonwebtoken';


import { insertDenuncia, datosDenuncia,  obtenerNumTramite,  countDenuncias, eliminarDenuncia } from '../services/denuncia.service';
import { generateProteccionFormPDF } from '../services/pdfs/denunciapdf.service.ts.service';

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
    const token:string = req.headers.authorization?.split(' ')[1] as string;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
     // Extrae el ID del usuario del token decodificado.
            const id_canton : number = Number((decoded as any).id_canton);
            

            // Si no se obtiene un ID válido, devuelve un error de autorización.
            if (!id_canton) return res.status(401).json("Unauthorized");

    const denuncias = await Denuncia.findAll({
      where: { id_canton: id_canton },
      include: [
        {
          model: Afectado,
          as:'afectados',
          attributes: ['nombres', 'apellidos','cedula']
        },
        
      ]
    });

    

    // Transformamos la respuesta al formato deseado
    const resultado = denuncias.map(denuncia => ({
  codigoTramite: denuncia.codigoTramite,
  fecha: denuncia.fechaCreado,
  id_canton: denuncia.id_canton,
  idDenuncia: denuncia.id,
  Afectado: denuncia.afectados?.map((a: Afectado) => `${a.nombres} ${a.apellidos}`),
  cedulasAfectados: denuncia.afectados?.map((a: Afectado) => a.cedula)
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



export const obtenerNumeroTramite = async (req:Request, res:Response) => {
  try {
    const id_canton= req.user.id_canton
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

//----------controldor pdf--------------------//
export const getProteccionFormPDF = (req: Request, res: Response) => {
  generateProteccionFormPDF(res);
};
