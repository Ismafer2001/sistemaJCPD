import { Router } from 'express';
import { getExpedientesPorDenuncia, postSubirExpediente, putEditarExpediente } from '../controllers/subirexpediente.controller';
// Ruta para actualizar expediente (protegida)

import { upload } from '../middleware/multer.middleware';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();
const path = require('path');
const fs = require('fs');

// Ruta para subir expediente (protegida)
router.post('/', verificarToken, upload.single('archivo'), postSubirExpediente);

router.get('/:idDenuncia', verificarToken, getExpedientesPorDenuncia);
router.get('/files/:codigoTramite/:tipoCarpeta/:nombreArchivo',verificarToken ,(req, res) => {
    // 1. El JWT ya debió ser validado por un middleware previo (ej. tu verifyToken)
    // 2. Extraemos los datos del token que ya tienes (canton, rol, etc.)
    const cantonUsuario = req.user.canton; 
    const codigoTramite = req.params.codigoTramite;
    const nombreArchivo = req.params.nombreArchivo;
    const tipoCarpeta = req.params.tipoCarpeta; 
    

    // 3. VALIDACIÓN CRÍTICA: ¿El usuario es del mismo cantón que el archivo?
   /* if (cantonUsuario !== cantonArchivo) {
        return res.status(403).json({ message: "No tienes permiso para ver archivos de otro cantón" });
    }*/

    // 4. Construir la ruta física (que ahora es privada)
   const rutaAbsoluta = path.join(__dirname, '..', '..', 'uploads', codigoTramite, tipoCarpeta, nombreArchivo);
    console.log("Ruta absoluta del archivo:", rutaAbsoluta);

    // 5. Verificar si el archivo existe y enviarlo
    if (fs.existsSync(rutaAbsoluta)) {
        res.sendFile(rutaAbsoluta);
    } else {
        res.status(404).json({ message: "Archivo no encontrado" });
    }
});

router.put('/:idExpediente', verificarToken, upload.single('archivo'), putEditarExpediente);




export default router;
