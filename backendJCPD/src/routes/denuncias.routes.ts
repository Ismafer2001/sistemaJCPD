import { Router } from 'express';
import { crearDenuncia } from '../controllers/denuncia.controller';
import {
  getAllDenuncias,
  getDenunciaById,
  getDenunciasByTipo,
  getDenunciasByFecha,
  getEstadisticasDenuncias
} from '../controllers/denuncia.controller';
// Ruta para crear denuncias

const router = Router();
router.post('/', crearDenuncia);
// Obtener todas las denuncias
router.get('/', getAllDenuncias);

// Obtener una denuncia por ID
router.get('/:id', getDenunciaById);

// Obtener denuncias por tipo
router.get('/tipo/:tipo', getDenunciasByTipo);

// Obtener denuncias por fecha
router.get('/fecha', getDenunciasByFecha);

// Obtener estadísticas de denuncias
router.get('/estadisticas', getEstadisticasDenuncias);



export default router; 