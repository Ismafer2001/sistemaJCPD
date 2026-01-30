import { Router } from 'express';
import { createProvidencia, getProvidenciaById, getProvidenciaIdByDenunciaId, getProvidenciaPdf, updateProvidencia } from '../controllers/providencia.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Ruta para crear una nueva providencia
router.post('', verificarToken, createProvidencia);

// Ruta para obtener una providencia por ID
router.get('/providencia-completa/:id', verificarToken, getProvidenciaById);

// Ruta para obtener ID de providencia por ID de denuncia
router.get('/id-providencia/:idDenuncia', verificarToken, getProvidenciaIdByDenunciaId);

router.get('/crearpdf/:id',  getProvidenciaPdf);

// Ruta para actualizar una providencia
router.put('/:id', verificarToken, updateProvidencia);

export default router;
