import { Request, Response } from "express";
import { handlehttp} from "../../utils/error.handle";
import { contarMedidasCumplidasYNoCumplidas, FiltroSeguimientoMedidas } from "../../services/estadisticas/seguimientoMedidas.service";

const getMedidasCumplidasYNoCumplidas = async (req: Request, res: Response) => {
    try {
         const filtros = {
      grupoPrioritario: req.query.grupoPrioritario as string,
      id_canton: req.user?.id_canton,
      desde: req.query.desde as string,
      hasta: req.query.hasta as string,
    };
    console.log('controlador con filtros', filtros);
        const response = await contarMedidasCumplidasYNoCumplidas(filtros);
        res.send(response);
    } catch (e) {
        handlehttp(res, "ERROR_GET_MEDIDAS_CUMPLIDAS_NO_CUMPLIDAS");
    }
};

export { getMedidasCumplidasYNoCumplidas };
