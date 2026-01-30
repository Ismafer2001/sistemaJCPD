import { Router,  } from 'express';
import {  getNotificacionDTO,  postCreateOtro, postNotificacion, getNotificacionById, getNotificacionPDF, putNotificacion, getInvolucradosANotificar, getOtrosANotificar, deleteOtroNotificado, putOtroNotificado } from '../controllers/notificacion.controller';
import { verificarToken } from '../middleware/auth.middleware';



const router = Router();


// Rutas específicas primero
router.get('/notificar/:id', getNotificacionDTO);
router.get('/notificacion-completa/:id', getNotificacionById);
router.get('/crearpdf/:id', getNotificacionPDF);

// Rutas POST
router.post('/', postCreateOtro);
router.post('/notificacion', postNotificacion);

// Rutas PUT y DELETE
router.put('/otros/:id', putOtroNotificado);
router.delete('/otros/:id', deleteOtroNotificado);

// Rutas más generales al final
router.get('/involucrados-principales/:id', getInvolucradosANotificar);
router.get('/otros-involucrados/:id', getOtrosANotificar);
router.put('/:id', verificarToken, putNotificacion);

export default router;