import { Request, Response } from 'express';
import { handlehttp } from '../utils/error.handle';

export const uploadArchivo = (req: Request, res: Response) => {
    try {
        console.log("Archivo recibido:", req.file);
        console.log("Datos adicionales:", req.body);
        if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  res.json({
    mensaje: 'Archivo subido correctamente',
    nombre: req.file.filename,
    ruta: req.file.path
  });
        
    } catch (error) {
        handlehttp(res, 'error en la carga del archivo', error);
    }
  
};
