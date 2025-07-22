import { Request, Response } from 'express';
import { obtenerDenunciaParaAvocatoria } from '../services/avocatoria.service';

export const getDenunciaParaAvocatoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const denuncia: any = await obtenerDenunciaParaAvocatoria(id);
        const result = {
            id: denuncia.id,
            fecha_creado: denuncia.fecha_creado,
            codigoTramite: denuncia.codigoTramite,
            canton: denuncia.Canton?.canton || null,
            descripcion_hechos: denuncia.descripcion_hechos,
            afectados: (denuncia.afectados || []).map((af: any) => ({
                nombres: af.nombres,
                apellidos: af.apellidos,
                edad: af.edad,
                vulneraciones: (af.vulneraciones || []).map((v: any) => ({
                    id: v.id,
                    texto: v.vulneracion
                }))
            })),
            denunciante: (denuncia.denunciante || []).map((d: any) => ({
                nombres: d.nombres,
                apellidos: d.apellidos
            })),
            denunciados: (denuncia.denunciados || []).map((d: any) => ({
                nombres: d.nombres,
                apellidos: d.apellidos
            }))
        };
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ error: error.message || 'Error al obtener la denuncia' });
    }
};
