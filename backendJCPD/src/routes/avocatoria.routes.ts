import { Router } from 'express';
import { getDenunciaParaAvocatoria } from '../controllers/avocatoria.controller';
import { getMedidasIdentificadasPorDenuncia } from '../controllers/avocatoria.controller';

const router = Router();

// GET /api/avocaroria/:id
router.get('/:id', getDenunciaParaAvocatoria);
//router.get('/medidas/:id',getMedidasIdentificadasPorDenuncia)

export default router;
