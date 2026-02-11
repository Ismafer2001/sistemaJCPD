import { Router } from 'express';
import {
		postAudienciaPruebas,
		putAudienciaPruebas,
		getAudienciaPruebasDTO,
		getParticipantesAudienciaContestacionCtrl,
		postAgregarOtrosParticipantes,
		getVulneracionesPorAfectado,
		postVulneracionIdentificada,
		deleteVulneracionIdentificada,
		putVulneracionIdentificada,
		getAudienciaPruebasCompleta,
		getAudienciaPruebasPdf,
		postAudienciaPruebasConArchivos,
		putAudienciaPruebasConArchivos
	} from '../controllers/audienciaPruebas.controller';

import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';
import { upload } from '../middleware/multer.middleware';
// Vulneraciones identificadas


const router = Router();
const path = require('path');
const fs = require('fs');


// Obtener todos los datos completos de una audiencia de pruebas
router.get('/datosaudienciapruebacompleta/:id',verificarToken, getAudienciaPruebasCompleta);

router.get('/files/:codigoTramite/pruebas/:nombreArchivo',verificarToken, (req, res) => {
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
   const rutaAbsoluta = path.join(__dirname, '..', '..', 'uploads', codigoTramite, 'pruebas', nombreArchivo);
    console.log("Ruta absoluta del archivo:", rutaAbsoluta);

    // 5. Verificar si el archivo existe y enviarlo
    if (fs.existsSync(rutaAbsoluta)) {
        res.sendFile(rutaAbsoluta);
    } else {
        res.status(404).json({ message: "Archivo no encontrado" });
    }
});



// Crear audiencia de pruebas
router.post('', verificarToken,verificarCantonDenuncia, postAudienciaPruebas);

// Crear audiencia de pruebas CON archivos específicos por abogado
router.post('/con-archivos', 
	verificarToken,
	 
	upload.any(), // Permitir campos dinámicos como archivo_abogado_0, archivo_abogado_1, etc.
	postAudienciaPruebasConArchivos
);

// Actualizar audiencia de pruebas
router.put('/:id', verificarToken, putAudienciaPruebas);

// Actualizar audiencia de pruebas CON archivos específicos por abogado
router.put('/con-archivos/:id', 
	verificarToken,
	upload.any(), // Permitir campos dinámicos como archivo_abogado_0, archivo_abogado_1, etc.
	putAudienciaPruebasConArchivos
);

// Obtener DTO de audiencia de pruebas
router.get('/datos-audiencia-prueba/:id', verificarToken,verificarCantonDenuncia, getAudienciaPruebasDTO);

// Obtener participantes de audiencia de contestación (sin representantes)
router.get('/participantes-audiencia-prueba/:idDenuncia', verificarToken,verificarCantonDenuncia, getParticipantesAudienciaContestacionCtrl);
// Agregar otros participantes
router.post('/agregar-participante',verificarToken,verificarCantonDenuncia, postAgregarOtrosParticipantes);

//obtener medidas emergentes por afectado

//obtener vulneraciones identificadas por afectado
router.get('/vulneraciones/:id',verificarToken,getVulneracionesPorAfectado);

// Vulneraciones identificadas
router.post('/vulneracion-identificada',verificarToken, postVulneracionIdentificada);
router.delete('/vulneracion-identificada/:id', verificarToken, deleteVulneracionIdentificada);
router.put('/vulneracion-identificada/:id', verificarToken, putVulneracionIdentificada);

router.get('/crearpdf/:id',verificarToken,  getAudienciaPruebasPdf);



export default router;
