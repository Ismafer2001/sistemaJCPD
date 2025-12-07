// routes/reportes.routes.ts
import { Router } from 'express';
import { getDenunciasTotales } from '../../controllers/estadisticas/DenunciaReporte.controller';
import { verificarToken } from '../../middleware/auth.middleware';
import { getavocatoriaReporte, getMedidasAgrupadasPorArticulo, getVulneracionesAgrupadas } from '../../controllers/estadisticas/avocatoriaReporte.controller';
import { getnotificacionesTotales } from '../../controllers/estadisticas/notificacionesReporte.controller';
import { getCitacionesTotales } from '../../controllers/estadisticas/citacionesReporte.controller';
import { getAudienciasContestacionTotales } from '../../controllers/estadisticas/audienciaContestacionReporte.controller';
import { getAudienciasPruebasTotales } from '../../controllers/estadisticas/audienciaPruebasReporte.controller';
import { getMedidasDefinitivasAgrupadasPorArticulo, getResolucionesTotales } from '../../controllers/estadisticas/resolucionesReporte.controller';

const router = Router();

router.get('/denunciastotales', verificarToken, getDenunciasTotales);
router.get('/avocatoriasreporte', verificarToken, getavocatoriaReporte);
router.get('/avocatoriasreporte/medidasagrupadasporarticulo', verificarToken, getMedidasAgrupadasPorArticulo);
router.get('/avocatoriasreporte/vulneracionesagrupadas', verificarToken, getVulneracionesAgrupadas);
router.get('/notificacionestotales', verificarToken, getnotificacionesTotales);
router.get('/citacionestotales', verificarToken, getCitacionesTotales);
// Ruta para reportes/estadísticas de audiencias de contestación
router.get('/audienciascontestaciontotales', verificarToken, getAudienciasContestacionTotales);

// Ruta para reportes/estadísticas de audiencias de pruebas
router.get('/audienciaspruebastotales', verificarToken, getAudienciasPruebasTotales);
// Ruta para reportes/estadísticas de resoluciones
router.get('/resolucionestotales', verificarToken, getResolucionesTotales);

// Ruta para obtener medidas agrupadas por artículo
router.get('/resoluciones/medidasagrupadasporarticulo', verificarToken, getMedidasDefinitivasAgrupadasPorArticulo);
export default router;