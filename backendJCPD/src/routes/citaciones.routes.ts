import { Router,  } from 'express';

import { getCitacionesDTO, getPersonasCitacion, postCitacion } from '../controllers/citaciones.controller';


const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/:id',getPersonasCitacion);
router.get('/citar/:id',getCitacionesDTO);
router.post('/', postCitacion); 




export default router; 