
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
    // 1. Validar que el middleware de Multer nos dejó un archivo en memoria
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Archivo requerido' });
    }
    
    // 2. Construir el payload adaptado para el nuevo servicio
    const payload = {
      // Le pasamos el objeto file COMPLETO de multer (que ahora contiene 'buffer' y 'originalname')
      file: req.file, 
      
      // Pasamos los textos directamente en el primer nivel del objeto
      responsable: req.body.responsable,
      razon: req.body.razon,
      sancion: req.body.sancion,
      codigoTramite:req.body.codigoTramite,
      
      
      // Parseamos las medidas (excelente práctica hacerlo aquí)
      medidas: req.body.medidas ? JSON.parse(req.body.medidas) : []
    };
    console.log(req.body.codigoTramite)
    
    // 3. Ejecutar la lógica de negocio
    const resultado = await agregarCumplimientoMedidas(payload);
    
    res.status(201).json(resultado);
  } catch (error) {
    // Si algo falla (ej. error de base de datos o de Supabase), lo atrapamos
    handlehttp(res, 'Error al agregar cumplimiento de medidas', error);
  }
};

// Controlador para actualizar cumplimiento de medidas
export const putActualizarCumplimientoMedidas = async (req: Request, res: Response) => {
  try {
    // 1. Validar solo lo estrictamente obligatorio (idPath)
    if (!req.body.idPath) {
      return res.status(400).json({ success: false, message: 'idPath es requerido' });
    }
    
    // NOTA: Ya no bloqueamos si no hay req.file. Si el usuario no manda archivo, 
    // req.file será undefined y el servicio simplemente actualizará los textos/medidas.

    // 2. Construir el payload plano para el servicio
    const payload = {
      idPath: parseInt(String(req.body.idPath), 10),
      file: req.file, // Pasamos el archivo crudo (con su buffer de RAM) si es que viene
      
      // Textos directos
      responsable: req.body.responsable,
      razon: req.body.razon,
      sancion: req.body.sancion,
      codigoTramite: req.body.codigoTramite, // Opcional, por si lo envías para organizar carpetas
      
      // Parsear las medidas
      medidas: req.body.medidas ? JSON.parse(req.body.medidas) : []
    };

    // 3. Ejecutar el servicio
    // El servicio YA se encarga de:
    // - Subir el archivo nuevo (si existe) a Local o Nube
    // - Borrar el archivo viejo (si existe) de Local o Nube
    // - Actualizar la base de datos
    const resultado = await actualizarCumplimientoMedidas(payload);

    // 4. Responder al cliente
    res.status(200).json(resultado);
    
  } catch (error) {
    // Si algo falló en la validación, en Supabase, o en la DB, lo capturamos aquí
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
