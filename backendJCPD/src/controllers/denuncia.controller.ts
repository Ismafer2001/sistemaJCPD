import { Request, Response } from 'express';
import { Denuncia, Denunciante, Denunciado, Afectado, Hecho, Vulneracion, VulneracionIdentificada } from '../models';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';

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
            // Datos del denunciante
            denunciante,
            // Datos de los denunciados
            denunciados,
            // Datos de los afectados
            afectados,
            // Datos del hecho
            hecho,
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
            usuario_creador
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

        // 5. Crear el hecho
        if (hecho) {
            const nuevoHecho = await Hecho.create({
                ...hecho,
                idDenuncia: nuevaDenuncia.id
            }, { transaction: t });

            // 6. Asociar las vulneraciones al hecho
            if (vulneraciones && vulneraciones.length > 0) {
                await Promise.all(vulneraciones.map((vulneracionId: number) => 
                    VulneracionIdentificada.create({
                        hechoId: nuevoHecho.id,
                        vulneracionId
                    }, { transaction: t })
                ));
            }
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
