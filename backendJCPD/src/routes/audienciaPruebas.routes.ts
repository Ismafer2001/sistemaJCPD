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
		getAudienciaPruebasPdf
	} from '../controllers/audienciaPruebas.controller';
import { getAudienciasPruebasTotales } from '../controllers/estadisticas/audienciaPruebasReporte.controller';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';
// Vulneraciones identificadas


const router = Router();


// Obtener todos los datos completos de una audiencia de pruebas
router.get('/datosaudienciapruebacompleta/:id',verificarToken, getAudienciaPruebasCompleta);;



// Crear audiencia de pruebas
router.post('', verificarToken,verificarCantonDenuncia, postAudienciaPruebas);

// Actualizar audiencia de pruebas
router.put('/:id', verificarToken, putAudienciaPruebas);

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
