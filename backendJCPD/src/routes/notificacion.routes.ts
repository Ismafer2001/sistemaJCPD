import { Router,  } from 'express';
import { createOtro, getNotificacionDTO, getPersonasNotificar } from '../controllers/notificacion.controller';


const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/:id',getPersonasNotificar);
router.get('/notificar/:id',getNotificacionDTO);
router.post('/',createOtro);



export default router; 