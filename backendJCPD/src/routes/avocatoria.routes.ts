import { Router } from 'express';
import { getAfectadosAvocatoria, getAvocatoriaCompletaController, getAvocatoriaPdf, getDenunciaParaAvocatoria, postAvocatoria, putAvocatoria } from '../controllers/avocatoria.controller';
import { getMedidasIdentificadasPorAfecado } from '../controllers/avocatoria.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';

const router = Router();

// GET /api/avocaroria/:id
router.get('/:id',verificarToken,verificarCantonDenuncia, getDenunciaParaAvocatoria);
router.get('/avocatoria-completa/:id', verificarToken, getAvocatoriaCompletaController);

router.get('/afectados/:id', getAfectadosAvocatoria);
router.get('/medidas/:id',getMedidasIdentificadasPorAfecado)
router.post('', postAvocatoria);
router.get('/crearpdf/:id',verificarToken,  getAvocatoriaPdf);
router.put('/:id', verificarToken, putAvocatoria);

export default router;
