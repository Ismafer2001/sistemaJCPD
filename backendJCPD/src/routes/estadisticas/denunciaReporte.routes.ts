// routes/reportes.routes.ts
import { Router } from 'express';
import { getDenunciasTotales } from '../../controllers/estadisticas/DenunciaReporte.controller';
import { verificarToken } from '../../middleware/auth.middleware';
import { getavocatoriaReporte, getMedidasAgrupadasPorArticulo, getVulneracionesAgrupadas } from '../../controllers/estadisticas/avocatoriaReporte.controller';
import { getnotificacionesTotales } from '../../controllers/estadisticas/notificacionesReporte.controller';
import { getCitacionesTotales } from '../../controllers/estadisticas/citacionesReporte.controller';

const router = Router();

router.get('/denunciastotales', verificarToken, getDenunciasTotales);
router.get('/avocatoriasreporte', verificarToken, getavocatoriaReporte);
router.get('/avocatoriasreporte/medidasagrupadasporarticulo', verificarToken, getMedidasAgrupadasPorArticulo);
router.get('/avocatoriasreporte/vulneracionesagrupadas', verificarToken, getVulneracionesAgrupadas);
router.get('/notificacionestotales', verificarToken, getnotificacionesTotales);
router.get('/citacionestotales', verificarToken, getCitacionesTotales);
export default router;