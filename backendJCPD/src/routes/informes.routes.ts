import { Router } from 'express';
import * as informesController from '../controllers/informes.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Rutas protegidas - requieren autenticación
router.use(verificarToken);

// POST /informes - Crear nuevo informe
router.post('/', informesController.crearInforme);

// GET /informes/denuncia/:idDenuncia - Obtener informes por denuncia
router.get('/informes/:idDenuncia', informesController.obtenerInformesPorDenuncia);

// GET /informes/avocatoria/:idDenuncia - Obtener avocatoria por denuncia
router.get('/datosinforme/:idDenuncia', informesController.obtenerDatosParaInforme);

// GET /informes/:id - Obtener informe por ID
router.get('/informe-completo/:id', informesController.obtenerInformePorId);

export default router;
