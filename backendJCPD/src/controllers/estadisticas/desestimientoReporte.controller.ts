import { Request, Response } from "express";
import { handlehttp } from "../../utils/error.handle";
import { contarDesestimientosAprobados, FiltroDesestimiento } from "../../services/estadisticas/desestimiento.service";

const getDesestimientosTotales = async (req: Request, res: Response) => {
    try {
        const filtros: FiltroDesestimiento = {
            grupoPrioritario: req.query.grupoPrioritario as string,
            id_canton: req.user?.id_canton,
            desde: req.query.desde as string,
            hasta: req.query.hasta as string,
        };
        const response = await contarDesestimientosAprobados(filtros);
        res.json(response);
    } catch (e) {
        handlehttp(res, "ERROR_GET_DESESTIMIENTOS_TOTALES");
    }
};

export { getDesestimientosTotales };