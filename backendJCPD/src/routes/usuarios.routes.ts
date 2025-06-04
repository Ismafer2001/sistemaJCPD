import { Router } from 'express';
import * as UsuariosController from '../controllers/usuarios.controller';
import { asyncHandler } from '../utils/syncHandler';

const router = Router();

router.get('/', asyncHandler(UsuariosController.listarUsuarios));
router.get('/:id', asyncHandler(UsuariosController.obtenerUsuarioPorId));
router.post('/', asyncHandler(UsuariosController.crearUsuario));
router.put('/:id', asyncHandler(UsuariosController.editarUsuario));
router.patch('/:id/estado', asyncHandler(UsuariosController.cambiarEstado));
router.delete('/:id', asyncHandler(UsuariosController.eliminarUsuario));

export default router;
