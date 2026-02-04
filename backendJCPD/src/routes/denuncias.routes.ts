import { putDenuncia } from '../controllers/denuncia.controller';

import { Router } from 'express';
import { getCrearPdfDenuncia, getDenunciaCompletaCtrl } from '../controllers/denuncia.controller';
import { postCrearDenuncia, deleteDenuncia, getTotalDenunciaActivasController, getObtenerNumeroTramite,   } from '../controllers/denuncia.controller';
import {
  getAllDenuncias,
  getDenunciaById,
} from '../controllers/denuncia.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';
const router = Router();
// Obtener denuncia completa para edición/duplicado/pdf
router.get('/denuncia-completa/:id',verificarToken,verificarCantonDenuncia, getDenunciaCompletaCtrl);

//---------RUTAS REUTILIZABLES POR GRUPOPRIORITARIO--------------//
router.get('/',verificarToken, getAllDenuncias);//obtener todas las denuncias
router.get('/num_tramite',verificarToken, getObtenerNumeroTramite);//automzatizar codigo de tramite
router.get('/countdenunciasActivas', verificarToken, getTotalDenunciaActivasController);//contar denuncias activas totales
router.get('/:id', verificarToken,verificarCantonDenuncia, getDenunciaById);// Obtener una denuncia por ID
router.put('/:id',verificarToken,verificarCantonDenuncia, putDenuncia);// Actualizar denuncia

//---------------RUTAS ESPECIFICAS PARA DENUNCIAS NNA--------------//

router.post('/',verificarToken,verificarCantonDenuncia, postCrearDenuncia);// Ruta para crear denuncias
router.delete('/:id',verificarToken,verificarCantonDenuncia, deleteDenuncia);// Ruta para eliminar denuncias

//------------------- generar pdf denuncia nna---------------///

router.get('/crearpdf/:id',verificarToken,verificarCantonDenuncia,  getCrearPdfDenuncia);



export default router; 