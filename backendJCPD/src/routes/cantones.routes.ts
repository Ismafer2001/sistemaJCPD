
import { Router } from 'express';
import { obtenerCantones } from '../controllers/cantones.controller';

const router = Router();

router.get('/cantones', obtenerCantones);

export default router;
