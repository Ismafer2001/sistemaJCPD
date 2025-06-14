import { Router,} from 'express';
import { iniciarsesion, obtenerPerfil } from '../controllers/auth.controller';
import { verificarToken} from '../middleware/auth.middleware';



const router = Router();

router.post('/login', iniciarsesion);
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;
