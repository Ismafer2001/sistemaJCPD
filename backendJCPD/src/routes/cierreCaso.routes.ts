import express from 'express';
import { postCrearCierreCaso, getDatosParaCierreCaso } from '../controllers/cierreCaso.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = express.Router();

// Ruta para obtener datos necesarios para cierre de caso
router.get('/datos/:id', verificarToken, getDatosParaCierreCaso);

// Ruta para crear un cierre de caso
router.post('', verificarToken, postCrearCierreCaso);

export default router;