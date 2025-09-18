import { editarAvocatoria } from '../services/avocatoria.service';
import { crearPdfavocatoriaNNA } from '../services/pdfs/avocatoriapdf.service';
import { Request, Response } from 'express';
import { crearAvocatoria,
         medidasPorAfectado,
         obtenerAfectados,
         obtenerDenunciaParaAvocatoria,
         getAvocatoriaCompleta } from '../services/avocatoria.service';
import { handlehttp } from '../utils/error.handle';


//controlador para obtener datos de la denuncia que tendra relacion con la avocatoria
export const getDenunciaParaAvocatoria = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const denuncia: any = await obtenerDenunciaParaAvocatoria(id);
        
        console.log(denuncia)
        res.json(denuncia);
    } catch (error: any) {
        handlehttp(res,'get_error_datosaparaavcatoria',error)
    }
};
//controlador para obtener datos completos de una avocatoria existente
export const getAvocatoriaCompletaController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const avocatoria = await getAvocatoriaCompleta(Number(id));
    res.json(avocatoria);
  } catch (error) {
    handlehttp(res, 'get_error_avocatoria_completa', error);
  }
};

//controlador para obtener las medidas identificadas en la fase de denuncia de un afectado seleccionado

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
//controlador para crear una nueva avocatoria
export const postAvocatoria = async (req: Request, res: Response) =>{
   try {
    const nuevaAvocatoria = await crearAvocatoria(req.body);
    res.status(201).json(nuevaAvocatoria);
  } catch (error) {
    if (error instanceof Error && error.name === "AvocatoriaYaExiste") {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }

    handlehttp(res,"error_post_crearAvocatoria", error);
  }
}
//controlador para obtener los afectados de una denuncia seleccionada
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
//controlador para editar una avocatoria existente
export const putAvocatoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await editarAvocatoria(Number(id), req.body);
    res.json(result);
  } catch (error) {
    handlehttp(res, 'put_error_editarAvocatoria', error);
  }
};



//----------------pdfs--------------------//
export const getAvocatoriaPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await crearPdfavocatoriaNNA(res, Number(id));
   
  } catch (error) {
    handlehttp(res, 'get_error_pdf_avocatoria', error);
  }
};




