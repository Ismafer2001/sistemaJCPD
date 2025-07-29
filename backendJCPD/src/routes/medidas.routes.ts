import { Router,  } from 'express';
import { getAllMedidas,  } from '../controllers/medidas.controller';

const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/', getAllMedidas);



export default router; 