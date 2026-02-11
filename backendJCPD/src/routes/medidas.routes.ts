import { Router,  } from 'express';
import { getAllMedidas, getMedidasEmergentesPorAfectado, postMedidasEmergentes, putEditarMedidaEmergente, deleteMedidaEmergente, getMedidasDefinitivasPorAfectado, postMedidasDefinitivas, putEditarMedidaDefinitiva, getMedidasIdentificadasPorAfectado, deleteMedidaDefinitiva } from '../controllers/medidas.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Obtener todas las medidas agrupadas por artículo
router.get('/', getAllMedidas);
router.get('/medidas-identificadas/:id',verificarToken, getMedidasIdentificadasPorAfectado);
router.get('/medidas-emergentes/:id',verificarToken, getMedidasEmergentesPorAfectado);
router.get('/medidas-definitivas/:id',verificarToken, getMedidasDefinitivasPorAfectado);
router.post('/medidas-definitivas', verificarToken, postMedidasDefinitivas);
router.put('/medidas-definitivas/:id', verificarToken, putEditarMedidaDefinitiva);
router.post('/medidas-emergentes',verificarToken, postMedidasEmergentes);
router.put('/medidas-emergentes/:id',verificarToken, putEditarMedidaEmergente);
router.delete('/medidas-emergentes/:id',verificarToken, deleteMedidaEmergente);
router.delete('/medidas-definitivas/:id',verificarToken, deleteMedidaDefinitiva);


export default router; 