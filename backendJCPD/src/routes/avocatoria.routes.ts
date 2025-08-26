import { Router } from 'express';
import { getAfectadosAvocatoria, getDenunciaParaAvocatoria, postAvocatoria } from '../controllers/avocatoria.controller';
import { getMedidasIdentificadasPorAfecado } from '../controllers/avocatoria.controller';

const router = Router();

// GET /api/avocaroria/:id
router.get('/:id', getDenunciaParaAvocatoria);

router.get('/afectados/:id', getAfectadosAvocatoria);
router.get('/medidas/:id',getMedidasIdentificadasPorAfecado)
router.post('', postAvocatoria);

export default router;
