import { Router } from 'express';
import { getAllVulneraciones} from '../controllers/vulneraciones.controller';

const router = Router();

// Obtener todas las vulneraciones
router.get('/', getAllVulneraciones);

export default router