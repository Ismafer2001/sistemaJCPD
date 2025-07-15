
import { Router } from 'express';
import { obtenerCantones } from '../controllers/cantones.controller';

const router = Router();

router.get('', obtenerCantones);

export default router;
