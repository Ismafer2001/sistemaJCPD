import { Router } from 'express';
import { getAfectados, postCrearResolucion, getResolucionesPorDenuncia, getResolucionPdf, getResolucionCompleta, putActualizarResolucion } from '../controllers/resoluciones.controller';
import { getResolucionesTotales } from '../controllers/estadisticas/resolucionesReporte.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';



const router = Router();


// Ruta para obtener afectados de una denuncia
router.get('/afectados/:id',verificarToken,verificarCantonDenuncia, getAfectados);

// Ruta para crear una nueva resolución
router.post('', verificarToken, postCrearResolucion);

// Ruta para obtener resoluciones por denuncia (retorna solo ID)
router.get('/resolucion-denuncia/:idDenuncia', verificarToken,verificarCantonDenuncia, getResolucionesPorDenuncia);

// Ruta para obtener resolución completa con todos los datos relacionados
router.get('/resolucion-completa/:id', verificarToken, getResolucionCompleta);

// Ruta para actualizar una resolución
router.put('/:id', verificarToken, putActualizarResolucion);

router.get('/crearpdf/:id',verificarToken,  getResolucionPdf);


export default router;