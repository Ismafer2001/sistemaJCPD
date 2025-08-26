import { estatus } from "../../services/estatus/estatus.service";
import { handlehttp } from "../../utils/error.handle";
import { Request, Response } from 'express';

export const getEstatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const datos = await estatus(id)
        
  res.json(datos)

        

        
    } catch (error) {
        handlehttp(res, "Error_get_estatus", error);
        
    }

}