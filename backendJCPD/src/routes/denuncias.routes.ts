import { Router } from 'express';
import { crearDenuncia, deleteDenuncia, obtenerNumeroTramite, totalDenunciaActivasController, } from '../controllers/denuncia.controller';
import {
  getAllDenuncias,
  getDenunciaById,
  
  
} from '../controllers/denuncia.controller';
import { verificarToken } from '../middleware/auth.middleware';
// Ruta para crear denuncias

const router = Router();
router.post('/', crearDenuncia);
// Obtener todas las denuncias
router.get('/', getAllDenuncias);
router.get('/num_tramite',verificarToken, obtenerNumeroTramite);
router.get('/countdenunciasActivas', verificarToken, totalDenunciaActivasController);
router.delete('/:id', deleteDenuncia);



// Obtener una denuncia por ID
router.get('/:id', getDenunciaById);

export default router; 