import { Router} from 'express';
import { iniciarsesion,  } from '../controllers/auth.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { obtenerUsuarioActual } from '../controllers/auth.controller';




const router = Router();

router.post('/login', iniciarsesion);
router.get('/perfil', verificarToken, obtenerUsuarioActual); // Obtener perfil del usuario autenticado



export default router;
