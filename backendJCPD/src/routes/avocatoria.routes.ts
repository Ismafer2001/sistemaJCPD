import { Router } from 'express';
import { getAfectadosAvocatoria, getAvocatoriaCompletaController, getAvocatoriaPdf, getDenunciaParaAvocatoria, postAvocatoria, putAvocatoria } from '../controllers/avocatoria.controller';
import { getMedidasIdentificadasPorAfecado } from '../controllers/avocatoria.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/avocaroria/:id
router.get('/:id', getDenunciaParaAvocatoria);
router.get('/dtos/:id', verificarToken, getAvocatoriaCompletaController);

router.get('/afectados/:id', getAfectadosAvocatoria);
router.get('/medidas/:id',getMedidasIdentificadasPorAfecado)
router.post('', postAvocatoria);
router.get('/crearpdf/:id',  getAvocatoriaPdf);
router.put('/:id', verificarToken, putAvocatoria);

export default router;
