import { Request, Response } from 'express';
import { crearAvocatoria, obtenerDenunciaParaAvocatoria } from '../services/avocatoria.service';
import { Afectado, articulo, Denuncia, medida, medidasIdentificadas } from '../models';
import { handlehttp } from '../utils/error.handle';

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
                vulneraciones: (af.vulneracionesI || []).map((v: any) => ({
                    id: v.id,
                    vulneracion: v.Vulneracion?.vulneracion
                }))
            })),
            denunciante: (denuncia.Denunciantes || []).map((d: any) => ({
                nombres: d.nombres,
                apellidos: d.apellidos
            })),
            denunciados: (denuncia.Denunciados || []).map((d: any) => ({
                nombres: d.nombres,
                apellidos: d.apellidos
            }))
        };
        console.log(denuncia)
        res.json(result);
    } catch (error: any) {
        handlehttp(res,'get_error_datosaparaavcatoria',error)
    }
};

export const getMedidasIdentificadasPorDenuncia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar las medidas identificadas asociadas a la denuncia
    const afectados = await Afectado.findAll({
      include: [
        {
          model: medida,
          
          attributes: ['idarticulo', 'medidas'],
          through: { attributes: [] },
          include: [
            {
              model: articulo,
              
              attributes: ['articulo']
            }
          ]
        }
      ],
      where: { idDenuncia: id },
      attributes: []
    });

    // Formatear el resultado
    const resultado: any[] = [];
    afectados.forEach((af: any) => {
      (af.medidas || []).forEach((m: any) => {
        resultado.push({
          
          articulo: m.articulos?.articulo || null,
          medida: m.medidas || null
        });
      });
    });

    res.json(
       resultado
    );
  } catch (error) {
    console.error('Error al obtener medidas identificadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las medidas identificadas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const postAvocatoria = async (req: Request, res: Response) =>{
   try {
    const nuevaAvocatoria = await crearAvocatoria(req.body);
    res.status(201).json(nuevaAvocatoria);
  } catch (error) {
    if (error instanceof Error && error.message === "avocatoria ya existe") {
      return res.status(400).json({ mensaje: error.message });
    }

    handlehttp(res,"error_post_crearAvocatoria", error);
  }
}
