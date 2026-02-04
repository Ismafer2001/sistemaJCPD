
import { obtenerAfectados, agregarCumplimientoMedidas, actualizarCumplimientoMedidas, obtenerMedidasPendientesPorAfectado, obtenerMedidasCumplidasPorAfectado, obtenerMedidasDefinitivasPorAfectado } from '../services/seguimientoMedidas.service';
import { handlehttp } from '../utils/error.handle';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';



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
        fileName: req.file.filename,
        responsable: req.body.responsable,
        razon: req.body.razon,
        sancion: req.body.sancion
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

// Controlador para actualizar cumplimiento de medidas
export const putActualizarCumplimientoMedidas = async (req: Request, res: Response) => {
  try {
    // El archivo viene en req.file (por multer)
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Archivo requerido' });
    }

    // Validar que venga el idPath
    if (!req.body.idPath) {
      return res.status(400).json({ success: false, message: 'idPath es requerido' });
    }
   
    // Construir payload con la ruta del archivo subido
    const payload = {
      idPath: parseInt(req.body.idPath),
      file: { 
        path: req.file.path,
        fileName: req.file.filename,
        responsable: req.body.responsable,
        razon: req.body.razon,
        sancion: req.body.sancion
      },
      medidas: req.body.medidas ? JSON.parse(req.body.medidas) : []
    };

    console.log('Payload para actualizar recibido en el controlador:', payload);
    
    const resultado = await actualizarCumplimientoMedidas(payload);
    console.log('fileName anterior:', resultado.informeanterior.fileName)
    if(resultado.informeanterior.fileName){
      const rutaAnterior =path.resolve(resultado.informeanterior.pathInforme);
      fs.unlinkSync(rutaAnterior);
    }

    res.status(200).json(resultado);
  } catch (error) {
    handlehttp(res, 'Error al actualizar cumplimiento de medidas', error);
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

// Controlador para obtener todas las medidas definitivas por afectado
export const getMedidasDefinitivasPorAfectado = async (req: Request, res: Response) => {
  try {
    const idAfectado = parseInt(req.params.idAfectado);
    if (isNaN(idAfectado)) {
      return res.status(400).json({ success: false, message: 'ID de afectado inválido' });
    }
    
    const medidasDefinitivas = await obtenerMedidasDefinitivasPorAfectado(idAfectado);
    res.json({
      success: true,
      data: medidasDefinitivas,
      count: medidasDefinitivas.length
    });
  } catch (error) {
    handlehttp(res, 'Error al obtener medidas definitivas', error);
  }
};
