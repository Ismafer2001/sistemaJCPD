import { Router } from 'express';
import * as desestimientoController from '../controllers/desestimiento.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { getCodigoTramiteDenunciaDes } from '../controllers/desestimiento.controller';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';

const router = Router();

// Rutas protegidas - requieren autenticación
router.use(verificarToken);

// POST /desestimiento - Crear nuevo desestimiento
router.post(
  '/',
  
  desestimientoController.crearDesestimiento
);

router.get('/codigo-tramite/:id',verificarCantonDenuncia, getCodigoTramiteDenunciaDes);



// GET /desestimiento/denuncia/:idDenuncia - Obtener desestimiento por ID de denuncia
router.get(
  '/denuncia/:idDenuncia',
  
  desestimientoController.obtenerDesestimientoPorDenuncia
);

// GET /desestimiento/:id - Obtener desestimiento por ID
router.get(
  '/:id',
  
  desestimientoController.obtenerDesestimientoPorId
);

// PUT /desestimiento/:id - Actualizar desestimiento
router.put(
  '/:id',
  
  desestimientoController.actualizarDesestimiento
);



export default router;
