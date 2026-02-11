import { Router } from 'express';
import { getAfectadosSeguimientoMedidas, postAgregarCumplimientoMedidas, putActualizarCumplimientoMedidas, getMedidasPendientesPorAfectado, getMedidasCumplidasPorAfectado, getMedidasDefinitivasPorAfectado } from '../controllers/seguimientoMedidas.controller';
import { upload } from '../middleware/multer.middleware';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';

const router = Router();
const path = require('path');
const fs = require('fs');
// Rutas protegidas - requieren autenticación
router.use(verificarToken);

router.get('/files/:codigoTramite/seguimiento/:nombreArchivo', (req, res) => {
    // 1. El JWT ya debió ser validado por un middleware previo (ej. tu verifyToken)
    // 2. Extraemos los datos del token que ya tienes (canton, rol, etc.)
    const cantonUsuario = req.user.canton; 
    const codigoTramite = req.params.codigoTramite;
    const nombreArchivo = req.params.nombreArchivo;
    console.log("Canton usuario:", cantonUsuario);

    // 3. VALIDACIÓN CRÍTICA: ¿El usuario es del mismo cantón que el archivo?
   /* if (cantonUsuario !== cantonArchivo) {
        return res.status(403).json({ message: "No tienes permiso para ver archivos de otro cantón" });
    }*/

    // 4. Construir la ruta física (que ahora es privada)
   const rutaAbsoluta = path.join(__dirname, '..', '..', 'uploads', codigoTramite, 'seguimiento', nombreArchivo);
    console.log("Ruta absoluta del archivo:", rutaAbsoluta);

    // 5. Verificar si el archivo existe y enviarlo
    if (fs.existsSync(rutaAbsoluta)) {
        res.sendFile(rutaAbsoluta);
    } else {
        res.status(404).json({ message: "Archivo no encontrado" });
    }
});

router.get('/afectados/:id', getAfectadosSeguimientoMedidas);
router.get('/medidas-definitivas/:idAfectado', getMedidasDefinitivasPorAfectado);
router.get('/medidas-pendientes/:idAfectado', getMedidasPendientesPorAfectado);
router.get('/medidas-cumplidas/:idAfectado', getMedidasCumplidasPorAfectado);
router.post('/cumplimiento-medidas',  upload.single('archivo'), postAgregarCumplimientoMedidas);
router.put('/cumplimiento-medidas',  upload.single('archivo'), putActualizarCumplimientoMedidas);






export default router;