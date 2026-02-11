import { Router } from 'express';
import * as informesController from '../controllers/informes.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';

const router = Router();

// Rutas protegidas - requieren autenticación
router.use(verificarToken);

// POST /informes - Crear nuevo informe
router.post('/', informesController.crearInforme);

// GET /informes/denuncia/:idDenuncia - Obtener informes por denuncia
router.get('/informes/:idDenuncia',verificarCantonDenuncia, informesController.obtenerInformesPorDenuncia);

// GET /informes/avocatoria/:idDenuncia - Obtener avocatoria por denuncia
router.get('/datosinforme/:idDenuncia', verificarCantonDenuncia, informesController.obtenerDatosParaInforme);

router.get('/crearpdf/:id',informesController.getInformePdf); 

// GET /informes/:id - Obtener informe por ID
router.get('/informe-completo/:id', informesController.obtenerInformePorId);

// PUT /informes/:id - Actualizar informe por ID
router.put('/:id', informesController.actualizarInforme);

export default router;
