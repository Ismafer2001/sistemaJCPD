
import { Router } from 'express';
import { obtenerCantones } from '../controllers/cantones.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.get('',verificarToken, obtenerCantones);

export default router;
