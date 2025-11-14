import { Router } from 'express';
import { getAfectados, postCrearResolucion, getResolucionesPorDenuncia, getResolucionPorId, getResolucionPdf } from '../controllers/resoluciones.controller';
import { verificarToken } from '../middleware/auth.middleware';



const router = Router();

// Ruta para obtener afectados de una denuncia
router.get('/afectados/:id', getAfectados);

// Ruta para crear una nueva resolución
router.post('', verificarToken, postCrearResolucion);

// Ruta para obtener resoluciones por denuncia
router.get('/denuncia/:idDenuncia', getResolucionesPorDenuncia);

// Ruta para obtener una resolución por ID
router.get('/:id', getResolucionPorId);
router.get('/crearpdf/:id',  getResolucionPdf);


export default router;