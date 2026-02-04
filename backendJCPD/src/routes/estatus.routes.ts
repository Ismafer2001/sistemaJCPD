import { Router,  } from 'express';
import { getEstatus } from '../controllers/estatus/status.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';



const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/:id', verificarToken, verificarCantonDenuncia, getEstatus);




export default router; 