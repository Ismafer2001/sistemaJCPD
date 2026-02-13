import { Router } from 'express';
import { 
  postCrearControlImpugnacion,  
  putActualizarControlImpugnacion,
  getControlImpugnacionPorDenuncia, 
  
  getCodigoTramiteDenuncia 
} from '../controllers/controlImpugnacion.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';

const router = Router();

// Ruta para obtener código de trámite de una denuncia
router.get('/codigo-tramite/:id',verificarToken,verificarCantonDenuncia, getCodigoTramiteDenuncia);

// Ruta para crear un nuevo control de impugnación
router.post('/', verificarToken, postCrearControlImpugnacion);



// Ruta para obtener controles de impugnación por resolución
router.get('/:idResolucion', getControlImpugnacionPorDenuncia);



// Ruta para actualizar un control de impugnación
router.put('/:id', verificarToken, putActualizarControlImpugnacion);



export default router;
