import { Router } from 'express';


import { verificarToken } from '../middleware/auth.middleware';


const router = Router();

//----------- Ruta para obtener el reporte general de denuncias-------///

router.get('/pdfdenuncia', verificarToken);


export default router; 