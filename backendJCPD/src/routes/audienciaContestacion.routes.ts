import { Router } from 'express';
import { getAfectadosYDirigidoAController, getDatosAudienciaController, getRepresentantesInstitucionalesController, postaniadirParticipante, postaniadirRepresentante } from '../controllers/audienciaContestacion.controller';

const router = Router();
router.get('/datos-audiencia/:id', getDatosAudienciaController);

// GET /audiencia-contestacion/afectados-dirigidoA/:idDenuncia
router.get('/afectados-dirigidoA/:idDenuncia', getAfectadosYDirigidoAController);

// GET /audiencia-contestacion/representantes-institucionales/:idDenuncia
router.get('/representantes-institucionales/:idDenuncia', getRepresentantesInstitucionalesController);
router.post('/representantes-institucionales', postaniadirRepresentante);
router.post('/afectados-dirigidoA', postaniadirParticipante);

export default router;
