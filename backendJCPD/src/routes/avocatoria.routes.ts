import { Router } from 'express';
import { getDenunciaParaAvocatoria } from '../controllers/avocatoria.controller';

const router = Router();

// GET /api/avocaroria/:id
router.get('/:id', getDenunciaParaAvocatoria);

export default router;
