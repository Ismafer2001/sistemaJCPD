import { Router} from 'express';
import { getObtenerUsuarioActual, postloginUsuario, postValidarContrasena, putActualizarContrasena } from '../controllers/auth.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';





const router = Router();

router.post('/login', postloginUsuario);
router.get('/perfil', verificarToken, getObtenerUsuarioActual); // Obtener perfil del usuario autenticado
router.post('/validar-contrasena-admin', verificarToken, soloAdmin, postValidarContrasena); // Validar contraseña del usuario autenticado
router.put('/actualizar-contrasena', verificarToken, putActualizarContrasena); // Actualizar contraseña del usuario autenticado



export default router;
