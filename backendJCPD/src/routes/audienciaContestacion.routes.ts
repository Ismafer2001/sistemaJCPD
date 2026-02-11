import { Router } from 'express';
import { getAfectadosYDirigidoAController,
     getDatosAudienciaController,
      
       postaniadirParticipante,
         
        postAudienciaContestacion,
         getAudienciaContestacionCompleta,
          getAudienciaContestacionPdf,
           putAudienciaContestacion } from '../controllers/audienciaContestacion.controller';

import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';


const router = Router();



router.get('/datos-audiencia/:id',verificarToken,verificarCantonDenuncia, getDatosAudienciaController);

// GET /audiencia-contestacion/completa/:id
router.get('/Datosaudienciacompleta/:id',verificarToken, getAudienciaContestacionCompleta);

// GET /audiencia-contestacion/afectados-dirigidoA/:idDenuncia
router.get('/afectados-dirigidoA/:idDenuncia',verificarToken,verificarCantonDenuncia, getAfectadosYDirigidoAController);

// GET /audiencia-contestacion/representantes-institucionales/:idDenuncia

router.post('/afectados-dirigidoA',verificarToken,verificarCantonDenuncia, postaniadirParticipante);
router.post('', verificarToken,verificarCantonDenuncia, postAudienciaContestacion);
router.get('/crearpdf/:id',verificarToken,  getAudienciaContestacionPdf);
router.put('/:id',verificarToken,  putAudienciaContestacion);



export default router;
