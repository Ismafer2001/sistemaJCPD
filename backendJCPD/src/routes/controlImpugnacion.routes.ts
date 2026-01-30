import { Router } from 'express';
import { 
  postCrearControlImpugnacion, 
  getControlImpugnacionPorResolucion, 
  getControlImpugnacionPorId, 
  putActualizarControlImpugnacion, 
  getTodosLosControlesImpugnacion,
  getCodigoTramiteDenuncia 
} from '../controllers/controlImpugnacion.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Ruta para obtener código de trámite de una denuncia
router.get('/codigo-tramite/:id', getCodigoTramiteDenuncia);

// Ruta para crear un nuevo control de impugnación
router.post('/', verificarToken, postCrearControlImpugnacion);

// Ruta para obtener todos los controles de impugnación
router.get('/', getTodosLosControlesImpugnacion);

// Ruta para obtener controles de impugnación por resolución
router.get('/resolucion/:idResolucion', getControlImpugnacionPorResolucion);

// Ruta para obtener un control de impugnación por ID
router.get('/:id', getControlImpugnacionPorId);

// Ruta para actualizar un control de impugnación
router.put('/:id', verificarToken, putActualizarControlImpugnacion);



export default router;
