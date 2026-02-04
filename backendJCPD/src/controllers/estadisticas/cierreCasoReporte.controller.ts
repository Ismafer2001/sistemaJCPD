import { Request, Response } from "express";
import { handlehttp } from "../../utils/error.handle";
import { contarCierreCasosTotales, FiltroCierreCaso } from "../../services/estadisticas/cierreCasoReporte.service";

const getCierreCasosTotales = async (req: Request, res: Response) => {
    try {
        const filtros: FiltroCierreCaso = {
            grupoPrioritario: req.query.grupoPrioritario as string,
            id_canton: req.user?.id_canton,
            desde: req.query.desde as string,
            hasta: req.query.hasta as string,
        };
        const response = await contarCierreCasosTotales(filtros);
        res.json(response);
    } catch (e) {
        handlehttp(res, "ERROR_GET_CIERRE_CASOS_TOTALES");
    }
};

export { getCierreCasosTotales };