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
import { verificarCantonDenuncia } from '../middleware/canton.middleware';


const router = Router();
router.get('/citar/:id',verificarToken, verificarCantonDenuncia, getCitacionesDTO);
router.get('/datoscitacion/:id', verificarToken, getCitacion);
router.get('/crearpdf/:id', verificarToken, getCitacionPDF );

// Rutas POST
router.post('/', verificarToken, postCreateOtrosCitados);
router.post('/citacion', verificarToken, postCitacion);

// Rutas PUT y DELETE
router.put('/otros/:id', verificarToken, putOtroCitado);
router.delete('/otros/:id', verificarToken, deleteOtroCitado);



// Rutas más generales al final
router.get('/involucrados-principales/:id', verificarToken,verificarCantonDenuncia, getPersonasCitacion);
router.get('/otros-involucrados/:id', verificarToken,verificarCantonDenuncia, getOtrosACitar);



 
router.put('/:id',verificarToken, putCitacion);



export default router; 