import { Request, Response, RequestHandler } from 'express';
import { Denuncia, Denunciante, Denunciado, Afectado, Vulneracion, VulneracionesIdentificadas } from '../models';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import { Op } from 'sequelize';

export const crearDenuncia = async (req: Request, res: Response): Promise<void> => {
    const t: Transaction = await sequelize.transaction();

    try {
        const {
            // Datos de la denuncia
            medio,
            tipo_denuncia,
            canton,
            num_tramite,
            anio,
            mes,
            tramite,
            usuario_creador,
            descripcion_hechos,
            // Datos del denunciante
            denunciante,
            // Datos de los denunciados
            denunciados,
            // Datos de los afectados
            afectados,
            // Vulneraciones identificadas
            vulneraciones
        } = req.body;

        // 1. Crear la denuncia
        const nuevaDenuncia = await Denuncia.create({
            medio,
            tipo_denuncia,
            fecha_creado: new Date(),
            fecha_modificado: new Date(),
            canton,
            num_tramite,
            anio,
            mes,
            tramite,
            usuario_creador,
            descripcion_hechos
        }, { transaction: t });

        // 2. Crear el denunciante
        if (denunciante) {
            await Denunciante.create({
                ...denunciante,
                idDenuncia: nuevaDenuncia.id
            }, { transaction: t });
        }

        // 3. Crear los denunciados
        if (denunciados && denunciados.length > 0) {
            await Promise.all(denunciados.map((denunciado: any) => 
                Denunciado.create({
                    ...denunciado,
                    idDenuncia: nuevaDenuncia.id
                }, { transaction: t })
            ));
        }

        // 4. Crear los afectados
        if (afectados && afectados.length > 0) {
            await Promise.all(afectados.map((afectado: any) => 
                Afectado.create({
                    ...afectado,
                    idDenuncia: nuevaDenuncia.id
                }, { transaction: t })
            ));
        }

        // 5. Asociar las vulneraciones a la denuncia
        if (vulneraciones && vulneraciones.length > 0) {
            await Promise.all(vulneraciones.map((vulneracionId: number) => 
                VulneracionesIdentificadas.create({
                    denuncia_id: nuevaDenuncia.id,
                    vulneracion_id: vulneracionId
                }, { transaction: t })
            ));
        }

        await t.commit();

        res.status(201).json({
            success: true,
            message: 'Denuncia creada exitosamente',
            data: {
                id: nuevaDenuncia.id
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al crear la denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la denuncia',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener todas las denuncias
export const getAllDenuncias: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const denuncias = await Denuncia.findAll({
      include: [
        { model: Denunciante, as: 'denunciante' },
        { model: Afectado, as: 'afectados' },
        { model: Denunciado, as: 'denunciados' },
        { 
          model: Vulneracion,
          as: 'vulneraciones'
        }
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
