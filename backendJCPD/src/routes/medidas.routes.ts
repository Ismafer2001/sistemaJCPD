import { Router, RequestHandler } from 'express';
import { getAllMedidas, getMedidasByArticulo } from '../controllers/medidas.controller';

const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/', getAllMedidas);

// Obtener medidas por ID de artículo
router.get('/articulo/:idArticulo', getMedidasByArticulo as RequestHandler);

export default router; 