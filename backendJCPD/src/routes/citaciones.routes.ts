import { Router,  } from 'express';

import { getCitacion, getCitacionesDTO, getCitacionPDF, getPersonasCitacion, postCitacion, putCitacion } from '../controllers/citaciones.controller';
import { verificarToken } from '../middleware/auth.middleware';


const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/:id',getPersonasCitacion);
router.get('/citar/:id',getCitacionesDTO);
router.post('/', postCitacion); 
router.put('/:id',verificarToken, putCitacion);
router.get('/datoscitacion/:id', getCitacion);
router.get('/crearpdf/:id', getCitacionPDF );

export default router; 