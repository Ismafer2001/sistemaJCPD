import { Router } from 'express';
import { crearDenuncia, deleteDenuncia, getProteccionFormPDF, getTotalDenunciaActivasController, obtenerNumeroTramite,  } from '../controllers/denuncia.controller';
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
router.get('/countdenunciasActivas', verificarToken, getTotalDenunciaActivasController);
router.delete('/:id', deleteDenuncia);



// Obtener una denuncia por ID
router.get('/:id', getDenunciaById);


//----------- generar pdf dencunai-------///
router.get('/pdf', verificarToken, getProteccionFormPDF);



export default router; 