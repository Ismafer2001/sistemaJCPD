import { Router } from 'express';
import { crearDenuncia } from '../controllers/denuncia.controller';

const router = Router();

// Ruta para crear denuncias
router.post('/', crearDenuncia);

export default router; 