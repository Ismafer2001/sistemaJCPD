import { Router } from 'express';
import { upload } from '../middleware/multer.middleware';
import { uploadArchivo } from '../controllers/upload.controller';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// POST /upload?codigoTramite=...&tipoCarpeta=denuncia
router.post('/upload', verificarToken, upload.single('archivo'), uploadArchivo);

export default router;
