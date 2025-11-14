import { Router,  } from 'express';
import { getAllMedidas, getMedidasEmergentesPorAfectado, postMedidasEmergentes, putEditarMedidaEmergente, deleteMedidaEmergente, getMedidasDefinitivasPorAfectado, postMedidasDefinitivas, putEditarMedidaDefinitiva } from '../controllers/medidas.controller';

const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/', getAllMedidas);
router.get('/medidas-emergentes/:id', getMedidasEmergentesPorAfectado);
router.get('/medidas-definitivas/:id', getMedidasDefinitivasPorAfectado);
router.post('/medidas-definitivas', postMedidasDefinitivas);
router.put('/medidas-definitivas/:id', putEditarMedidaDefinitiva);
router.post('/medidas-emergentes', postMedidasEmergentes);
router.put('/medidas-emergentes/:id', putEditarMedidaEmergente);
router.delete('/medidas-emergentes/:id', deleteMedidaEmergente);



export default router; 