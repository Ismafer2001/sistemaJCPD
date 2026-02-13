import { Router } from 'express';
import {
  
  postRegistrarUsuario,
  getObtenerUsuarios,
  deleteUsuario,
  putUsuario,
  putEstadoUsuario,
 } from '../controllers/usuarios.controller';
import { obtenerActivosPorCantonPrincipal } from '../controllers/usuarios.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { soloAdmin } from '../middleware/rol.middleware';





const router = Router();
router.get('/activos',verificarToken, obtenerActivosPorCantonPrincipal);
router.put('/:id', putUsuario);  
//----------rutas solo admin-------------//
router.use(verificarToken, soloAdmin); 

//----------RUTAS GET ----------//
router.get('/', getObtenerUsuarios); // Listar usuarios activos

//----------RUTAS POST ----------//
router.post('/', postRegistrarUsuario); // Crear usuario

//----------RUTAS PUT ----------//
            // Actualizar usuario
router.put('/desactivar/:id', putEstadoUsuario);   // Desactivar (soft delete)

//----------RUTAS DELETE ----------//
router.delete('/:id', deleteUsuario); //eliminar usuario

export default router;





