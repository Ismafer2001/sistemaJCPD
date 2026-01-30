import { Router,  } from 'express';

import { deleteOtroCitado,
     getCitacion,
      getCitacionesDTO,
       getCitacionPDF,
        getOtrosACitar,
         getPersonasCitacion, postCitacion,
          postCreateOtrosCitados, 
          putCitacion, 
          putOtroCitado } from '../controllers/citaciones.controller';
import { verificarToken } from '../middleware/auth.middleware';


const router = Router();
router.get('/citar/:id',getCitacionesDTO);
router.get('/datoscitacion/:id', getCitacion);
router.get('/crearpdf/:id', getCitacionPDF );

// Rutas POST
router.post('/', postCreateOtrosCitados);
router.post('/citacion', postCitacion);

// Rutas PUT y DELETE
router.put('/otros/:id', putOtroCitado);
router.delete('/otros/:id', deleteOtroCitado);



// Rutas más generales al final
router.get('/involucrados-principales/:id', getPersonasCitacion);
router.get('/otros-involucrados/:id', getOtrosACitar);



 
router.put('/:id',verificarToken, putCitacion);



export default router; 