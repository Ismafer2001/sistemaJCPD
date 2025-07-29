import { Router,  } from 'express';

import { getCitacionesDTO, getPersonasCitacion } from '../controllers/citaciones.controller';


const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/:id',getPersonasCitacion);
router.get('/citar/:id',getCitacionesDTO);




export default router; 