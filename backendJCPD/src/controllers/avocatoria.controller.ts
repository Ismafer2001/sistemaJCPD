import { Request, Response } from 'express';
import { crearAvocatoria, medidasPorAfectado, obtenerAfectados, obtenerDenunciaParaAvocatoria } from '../services/avocatoria.service';
import { Afectado, articulo, Denuncia, medida, medidasIdentificadas } from '../models';
import { handlehttp } from '../utils/error.handle';

export const getDenunciaParaAvocatoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const denuncia: any = await obtenerDenunciaParaAvocatoria(id);
        const result = {
            id: denuncia.id,
            fechaCreado: denuncia.fechaCreado,
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

export const getMedidasIdentificadasPorAfecado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  const afectado = await medidasPorAfectado(id);
 

  res.json({
    afectado
  });
  } catch (error) {
    handlehttp(res,'error_get_medidasafectado',error)
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

export const getAfectadosAvocatoria = async (req: Request, res: Response) => {

  try {
     const id = parseInt(req.params.id);
  console.log("ID recibido:", id); 
  const afectados = await obtenerAfectados(id);
  res.json(afectados);
    
  } catch (error) {
    handlehttp(res,'error_get_afectadosavocatoria',error)
    
  }
 
}


