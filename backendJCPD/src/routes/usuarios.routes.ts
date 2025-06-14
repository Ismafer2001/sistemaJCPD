import { Router, Request, Response } from 'express';
import {
  crearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  desactivarUsuario
 } from '../controllers/usuarios.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarRol } from '../middleware/rol.middleware';

import bcrypt from 'bcryptjs';

const router = Router();
// Rutas solo para admin
router.use(verificarToken, verificarRol(['admin']));

router.post('/', crearUsuario);                     // Crear usuario
router.get('/', obtenerUsuarios);                   // Listar usuarios activos
router.put('/:id', actualizarUsuario);              // Actualizar usuario
router.put('/desactivar/:id', desactivarUsuario);   // Desactivar (soft delete)
router.delete('/:id', eliminarUsuario); 




export default router;





