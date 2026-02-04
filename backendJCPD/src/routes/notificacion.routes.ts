import { Router,  } from 'express';
import {  getNotificacionDTO,  postCreateOtro, postNotificacion, getNotificacionById, getNotificacionPDF, putNotificacion, getInvolucradosANotificar, getOtrosANotificar, deleteOtroNotificado, putOtroNotificado } from '../controllers/notificacion.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';



const router = Router();


// Rutas específicas primero
router.get('/notificar/:id',verificarToken,verificarCantonDenuncia, getNotificacionDTO);
router.get('/notificacion-completa/:id', verificarToken, getNotificacionById);
router.get('/crearpdf/:id', verificarToken, getNotificacionPDF);

// Rutas POST
router.post('/', verificarToken, postCreateOtro);
router.post('/notificacion', verificarToken, postNotificacion);

// Rutas PUT y DELETE
router.put('/otros/:id', verificarToken, putOtroNotificado);
router.delete('/otros/:id', verificarToken, deleteOtroNotificado);

// Rutas más generales al final
router.get('/involucrados-principales/:id', verificarToken,verificarCantonDenuncia, getInvolucradosANotificar);
router.get('/otros-involucrados/:id', verificarToken,verificarCantonDenuncia, getOtrosANotificar);
router.put('/:id', verificarToken, putNotificacion);

export default router;