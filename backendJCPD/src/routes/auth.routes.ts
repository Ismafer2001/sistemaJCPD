import { Router} from 'express';
import { getObtenerUsuarioActual, postloginUsuario,  } from '../controllers/auth.controller';
import { verificarToken } from '../middleware/auth.middleware';





const router = Router();

router.post('/login', postloginUsuario);
router.get('/perfil', verificarToken, getObtenerUsuarioActual); // Obtener perfil del usuario autenticado



export default router;
