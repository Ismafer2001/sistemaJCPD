import { Router } from 'express';
import { getAfectadosSeguimientoMedidas, postAgregarCumplimientoMedidas, getMedidasPendientesPorAfectado, getMedidasCumplidasPorAfectado } from '../controllers/seguimientoMedidas.controller';
import { upload } from '../middleware/multer.middleware';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/afectados/:id', getAfectadosSeguimientoMedidas);
router.get('/medidas-pendientes/:idAfectado', getMedidasPendientesPorAfectado);
router.get('/medidas-cumplidas/:idAfectado', getMedidasCumplidasPorAfectado);
router.post('/cumplimiento-medidas', verificarToken, upload.single('archivo'), postAgregarCumplimientoMedidas);




export default router;