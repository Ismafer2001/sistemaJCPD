
import { obtenerAfectados, agregarCumplimientoMedidas, obtenerMedidasPendientesPorAfectado, obtenerMedidasCumplidasPorAfectado } from '../services/seguimientoMedidas.service';
import { handlehttp } from '../utils/error.handle';
import { Request, Response } from 'express';


//controlador para obtener los afectados de una denuncia seleccionada
export const getAfectadosSeguimientoMedidas = async (req: Request, res: Response) => {

  try {
     const id = parseInt(req.params.id);
  console.log("ID recibido:", id); 
  const afectados = await obtenerAfectados(id);
  res.json(afectados);
    
  } catch (error) {
    handlehttp(res,'error_get_afectadosavocatoria',error)
    
  }
 
}

// Controlador para agregar cumplimiento de medidas
export const postAgregarCumplimientoMedidas = async (req: Request, res: Response) => {
  try {
    // El archivo viene en req.file (por multer)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Archivo requerido' });
    }
   
    
    // Construir payload con la ruta del archivo subido
    const payload = {
      file: { 
        path: req.file.path,
        fileName: req.file.filename
      },
      medidas: req.body.medidas ? JSON.parse(req.body.medidas) : []
    };

    console.log('Payload recibido en el controlador:', payload);
    
    const resultado = await agregarCumplimientoMedidas(payload);
    res.status(201).json(resultado);
  } catch (error) {
    handlehttp(res, 'Error al agregar cumplimiento de medidas', error);
  }
};

// Controlador para obtener medidas pendientes por afectado
export const getMedidasPendientesPorAfectado = async (req: Request, res: Response) => {
  try {
    const idAfectado = parseInt(req.params.idAfectado);
    if (isNaN(idAfectado)) {
      return res.status(400).json({ success: false, message: 'ID de afectado inválido' });
    }
    
    const medidasPendientes = await obtenerMedidasPendientesPorAfectado(idAfectado);
    res.json({
      success: true,
      data: medidasPendientes,
      count: medidasPendientes.length
    });
  } catch (error) {
    handlehttp(res, 'Error al obtener medidas pendientes', error);
  }
};

// Controlador para obtener medidas cumplidas por afectado
export const getMedidasCumplidasPorAfectado = async (req: Request, res: Response) => {
  try {
    const idAfectado = parseInt(req.params.idAfectado);
    if (isNaN(idAfectado)) {
      return res.status(400).json({ success: false, message: 'ID de afectado inválido' });
    }
    
    const medidasCumplidas = await obtenerMedidasCumplidasPorAfectado(idAfectado);
    res.json(medidasCumplidas);
  } catch (error) {
    handlehttp(res, 'Error al obtener medidas cumplidas', error);
  }
};
