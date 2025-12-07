import { Router } from 'express';
import { getAfectados, postCrearResolucion, getResolucionesPorDenuncia, getResolucionPdf, getResolucionCompleta, putActualizarResolucion } from '../controllers/resoluciones.controller';
import { getResolucionesTotales } from '../controllers/estadisticas/resolucionesReporte.controller';
import { verificarToken } from '../middleware/auth.middleware';



const router = Router();


// Ruta para obtener afectados de una denuncia
router.get('/afectados/:id', getAfectados);

// Ruta para crear una nueva resolución
router.post('', verificarToken, postCrearResolucion);

// Ruta para obtener resoluciones por denuncia (retorna solo ID)
router.get('/resolucion-denuncia/:idDenuncia', verificarToken, getResolucionesPorDenuncia);

// Ruta para obtener resolución completa con todos los datos relacionados
router.get('/resolucion-completa/:id', verificarToken, getResolucionCompleta);

// Ruta para actualizar una resolución
router.put('/:id', verificarToken, putActualizarResolucion);

router.get('/crearpdf/:id',  getResolucionPdf);


export default router;