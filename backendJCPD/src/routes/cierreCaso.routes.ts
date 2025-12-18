import express from 'express';
import { postCrearCierreCaso, getDatosParaCierreCaso, getDatosCierreCasoCompleto, getCierreCasoPdf, putActualizarCierreCaso } from '../controllers/cierreCaso.controller';
import { verificarToken } from '../middleware/auth.middleware';


const router = express.Router();

// Ruta para obtener datos necesarios para cierre de caso
router.get('/datos/:id', verificarToken, getDatosParaCierreCaso);

// Ruta para obtener los datos del cierre de caso con sus informes presentados
router.get('/cierre-caso-completa/:id', verificarToken, getDatosCierreCasoCompleto );

// Ruta para crear un cierre de caso
router.post('', verificarToken, postCrearCierreCaso);

// Ruta para actualizar un cierre de caso
router.put('/:id', verificarToken, putActualizarCierreCaso);

router.get('/crearpdf/:id',  verificarToken, getCierreCasoPdf);

export default router;