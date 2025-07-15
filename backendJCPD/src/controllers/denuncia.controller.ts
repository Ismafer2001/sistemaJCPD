import { Request, Response, RequestHandler } from 'express';
import { Denuncia, Denunciante, Denunciado, Afectado, Vulneracion, VulneracionesIdentificadas, medidasIdentificadas, medida } from '../models';

import sequelize from '../config/database';
import { Op } from 'sequelize';
import { insertDenuncia, datosDenuncia } from '../services/denuncia.service';

export const crearDenuncia = async (req: Request, res: Response): Promise<void> => {
  try {
    // Construir el payload tipado para el servicio
    const payload: datosDenuncia = {
      denuncia: req.body,
      denunciante: req.body.denunciante,
      denunciados: req.body.denunciados,
      afectados: req.body.afectados,
      vulneracion: req.body.vulneracion,
      medida: req.body.medida
      

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

// Obtener todas las denuncias
export const getAllDenuncias = async (req: Request, res: Response) => {
  try {
    const denuncias = await Denuncia.findAll({
      include: [
        { model: Denunciante, as: 'denunciante' },
        { model: Afectado, as: 'afectados' }

        
      ]
    });
    res.json(denuncias);
  } catch (error) {
    console.error('Error al obtener denuncias:', error);
    res.status(500).json({ message: 'Error al obtener las denuncias' });
  }
};

// Obtener una denuncia por ID
export const getDenunciaById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const denuncia = await Denuncia.findByPk(id, {
      include: [
        { model: Denunciante, as: 'denunciante' },
        { model: Afectado, as: 'afectados' },
        { model: Denunciado, as: 'denunciados' },
        { 
          model: Vulneracion,
          as: 'vulneraciones'
        },
        {
          model: medida,
          as: 'medidas'
        }
      ]
    });

    if (!denuncia) {
      res.status(404).json({ message: 'Denuncia no encontrada' });
      return;
    }

    res.json(denuncia);
  } catch (error) {
    console.error('Error al obtener la denuncia:', error);
    res.status(500).json({ message: 'Error al obtener la denuncia' });
  }
};

// Obtener denuncias por tipo
export const getDenunciasByTipo: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo } = req.params;
    const denuncias = await Denuncia.findAll({
      where: { tipo_denuncia: tipo },
      include: [
        { model: Denunciante, as: 'denunciante' },
        { model: Afectado, as: 'afectados' },
        { model: Denunciado, as: 'denunciados' },
        { 
          model: Vulneracion,
          as: 'vulneraciones'
        },
        {
          model: medida,
          as: 'medidas'
        }
      ]
    });
    res.json(denuncias);
  } catch (error) {
    console.error('Error al obtener denuncias por tipo:', error);
    res.status(500).json({ message: 'Error al obtener las denuncias por tipo' });
  }
};

// Obtener denuncias por fecha
export const getDenunciasByFecha: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      res.status(400).json({ message: 'Se requieren fechaInicio y fechaFin' });
      return;
    }

    const denuncias = await Denuncia.findAll({
      where: {
        fecha_creado: {
          [Op.between]: [new Date(fechaInicio as string), new Date(fechaFin as string)]
        }
      },
      include: [
        { model: Denunciante, as: 'denunciante' },
        { model: Afectado, as: 'afectados' },
        { model: Denunciado, as: 'denunciados' },
        { 
          model: Vulneracion,
          as: 'vulneraciones'
        },
        {
          model: medida,
          as: 'medidas'
        }
      ]
    });
    res.json(denuncias);
  } catch (error) {
    console.error('Error al obtener denuncias por fecha:', error);
    res.status(500).json({ message: 'Error al obtener las denuncias por fecha' });
  }
};

// Obtener estadísticas de denuncias
export const getEstadisticasDenuncias: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalDenuncias = await Denuncia.count();
    
    const denunciasPorTipo = await Denuncia.findAll({
      attributes: [
        'tipo_denuncia',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['tipo_denuncia']
    });

    const denunciasPorMes = await Denuncia.findAll({
      attributes: [
        'mes',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['mes'],
      order: [['mes', 'ASC']]
    });

    res.json({
      totalDenuncias,
      denunciasPorTipo,
      denunciasPorMes
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de denuncias' });
  }
};
