import { Request, Response } from 'express';
import { guardarExpediente, obtenerExpedientesPorDenuncia,  actualizarExpediente } from '../services/Subirexpedientes.service';
import { handlehttp } from '../utils/error.handle';

export const postSubirExpediente = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Archivo requerido' });
    }
    const { idDenuncia, tipoExpediente } = req.body;
    if (!idDenuncia || !tipoExpediente) {
      return res.status(400).json({ success: false, message: 'idDenuncia y tipoExpediente requeridos' });
    }
    const expediente = await guardarExpediente({
      file: req.file,
      idDenuncia: parseInt(idDenuncia, 10),
      tipoExpediente: String(tipoExpediente)
    });
    res.status(201).json({ success: true, expediente });
  } catch (error) {
    handlehttp(res, 'Error al subir expediente', error);
  }
};


export const getExpedientesPorDenuncia = async (req: Request, res: Response) => {
  try {
    const idDenuncia = parseInt(req.params.idDenuncia, 10);
    if (isNaN(idDenuncia)) {
      return res.status(400).json({ success: false, message: 'idDenuncia inválido' });
    }
    const expedientes = await obtenerExpedientesPorDenuncia(idDenuncia);
    res.json( expedientes );
  } catch (error) {
    handlehttp(res, 'Error al obtener expedientes', error);
  }
};



// Controlador para editar expediente
export const putEditarExpediente = async (req: Request, res: Response) => {
  try {
    const idExpediente = parseInt(req.params.idExpediente, 10);
    if (isNaN(idExpediente)) {
      return res.status(400).json({ success: false, message: 'idExpediente inválido' });
    }
    const { idDenuncia, tipoExpediente } = req.body;
    const expedienteEditado = await actualizarExpediente({
      idExpediente,
      file: req.file, // Puede ser undefined si no se sube archivo
      idDenuncia: idDenuncia ? parseInt(idDenuncia, 10) : undefined,
      tipoExpediente: tipoExpediente ? String(tipoExpediente) : undefined
    });
    res.json({ success: true, expediente: expedienteEditado });
  } catch (error) {
    handlehttp(res, 'Error al editar expediente', error);
  }
};

