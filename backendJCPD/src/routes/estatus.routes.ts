import { Router,  } from 'express';
import { getEstatus } from '../controllers/estatus/status.controller';
import { verificarToken } from '../middleware/auth.middleware';



const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/:id', verificarToken , getEstatus);




export default router; 