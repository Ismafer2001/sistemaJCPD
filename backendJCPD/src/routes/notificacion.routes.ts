import { Router,  } from 'express';
import {  getNotificacionDTO, getPersonasNotificar, postCreateOtro, postNotificacion, getNotificacionById, getNotificacionPDF, putNotificacion } from '../controllers/notificacion.controller';
import { verificarToken } from '../middleware/auth.middleware';



const router = Router();


router.get('/:id',getPersonasNotificar);
router.get('/notificar/:id',getNotificacionDTO);
router.post('/',postCreateOtro);
router.post('/notificacion',postNotificacion);
// Obtener los datos de una notificación por id
router.get('/notificacion-completa/:id', getNotificacionById);

router.get('/crearpdf/:id', getNotificacionPDF);
router.put('/:id', verificarToken, putNotificacion);

export default router;