import { Router } from 'express';
import {
  
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  desactivarUsuario,
  registrarUsuarioCtrl,
 } from '../controllers/usuarios.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';




const router = Router();

router.use(verificarToken, soloAdmin); 

router.post('/', registrarUsuarioCtrl);                     // Crear usuario
router.get('/', obtenerUsuarios);                   // Listar usuarios activos
router.put('/:id', actualizarUsuario);              // Actualizar usuario
router.put('/desactivar/:id', desactivarUsuario);   // Desactivar (soft delete)
router.delete('/:id', eliminarUsuario); 




export default router;





