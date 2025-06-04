import { Router } from 'express';
import { Usuario } from '../models/usuarios.models';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/syncHandler';
import { Request, Response } from 'express';

const router = Router();

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  const usuario = await Usuario.findOne({ where: { correo } });
  if (!usuario) {
    return res.status(401).json({ error: 'Correo incorrecto' });
  }

  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!contrasenaValida) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  res.json({
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    rol: usuario.rol,
    correo: usuario.correo
  });
}));

export default router;
