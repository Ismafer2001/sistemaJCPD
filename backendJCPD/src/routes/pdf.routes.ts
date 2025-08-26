import { Router } from 'express';


import { verificarToken } from '../middleware/auth.middleware';
import { getProteccionFormPDF } from '../controllers/denuncia.controller';

const router = Router();

//----------- Ruta para obtener el reporte general de denuncias-------///

router.get('/pdfdenuncia', verificarToken, getProteccionFormPDF);

export default router; 