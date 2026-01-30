import { Router } from 'express';
import * as inhibirseController from '../controllers/inhibirse.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Rutas protegidas - requieren autenticación
router.use(verificarToken);

// POST /inhibirse - Crear nueva inhibición
router.post('/', inhibirseController.crearInhibicion);

// GET /inhibirse/codigo-tramite/:id - Obtener código de trámite por ID denuncia
router.get('/codigo-tramite/:id', inhibirseController.getCodigoTramiteInhibirse);

// GET /inhibirse/deprecatorias/:idcanton - Obtener deprecatorias por cantón destino
router.get('/deprecatorias/:idcanton', inhibirseController.obtenerDeprecatoriasPorcanton);



// GET /inhibirse/:id - Obtener deprecatoria por ID
router.get('/:id', inhibirseController.obtenerDeprecatoriaPorId);

// PUT /inhibirse/:id/aceptar - Aceptar una inhibición
router.put('/:id/aceptar', inhibirseController.aceptarInhibicion);



export default router;
