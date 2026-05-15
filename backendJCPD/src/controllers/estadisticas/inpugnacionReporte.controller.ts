import { Request, Response } from "express";
import { handlehttp } from "../../utils/error.handle";
import { contarTotalPorReposicionYApelacion, FiltroImpugnacion } from "../../services/estadisticas/impunacion.service";

const getImpugnacionesTotales = async (req: Request, res: Response) => {
    try {
        console.log('llegue al controlador de impugnacion',);
        const filtros: FiltroImpugnacion = {
            grupoPrioritario: req.query.grupoPrioritario as string,
            id_canton: req.user?.id_canton!,
            desde: req.query.desde as string,
            hasta: req.query.hasta as string,
        };
        
        const response = await contarTotalPorReposicionYApelacion(filtros);
        
        res.json(response);
    } catch (e) {
        handlehttp(res, "ERROR_GET_IMPUGNACIONES_TOTALES");
    }
};

export { getImpugnacionesTotales };