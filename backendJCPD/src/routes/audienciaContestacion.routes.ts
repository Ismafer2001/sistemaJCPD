import { Router } from 'express';
import { getAfectadosYDirigidoAController,
     getDatosAudienciaController,
      
       postaniadirParticipante,
         
        postAudienciaContestacion,
         getAudienciaContestacionCompleta,
          getAudienciaContestacionPdf,
           putAudienciaContestacion } from '../controllers/audienciaContestacion.controller';
import { getAudienciasContestacionTotales } from '../controllers/estadisticas/audienciaContestacionReporte.controller';
import { verificarToken } from '../middleware/auth.middleware';


const router = Router();



router.get('/datos-audiencia/:id', getDatosAudienciaController);

// GET /audiencia-contestacion/completa/:id
router.get('/Datosaudienciacompleta/:id', getAudienciaContestacionCompleta);

// GET /audiencia-contestacion/afectados-dirigidoA/:idDenuncia
router.get('/afectados-dirigidoA/:idDenuncia', getAfectadosYDirigidoAController);

// GET /audiencia-contestacion/representantes-institucionales/:idDenuncia

router.post('/afectados-dirigidoA', postaniadirParticipante);
router.post('', postAudienciaContestacion);
router.get('/crearpdf/:id',  getAudienciaContestacionPdf);
router.put('/:id',  putAudienciaContestacion);



export default router;
