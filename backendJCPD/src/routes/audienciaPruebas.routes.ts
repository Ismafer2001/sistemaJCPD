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
// Vulneraciones identificadas


const router = Router();


// Obtener todos los datos completos de una audiencia de pruebas
router.get('/datosaudienciapruebacompleta/:id', getAudienciaPruebasCompleta);;



// Crear audiencia de pruebas
router.post('', postAudienciaPruebas);

// Actualizar audiencia de pruebas
router.put('/:id', putAudienciaPruebas);

// Obtener DTO de audiencia de pruebas
router.get('/datos-audiencia-prueba/:id', getAudienciaPruebasDTO);

// Obtener participantes de audiencia de contestación (sin representantes)
router.get('/participantes-audiencia-prueba/:idDenuncia', getParticipantesAudienciaContestacionCtrl);

// Agregar otros participantes
router.post('/agregar-participante', postAgregarOtrosParticipantes);

//obtener medidas emergentes por afectado

//obtener vulneraciones identificadas por afectado
router.get('/vulneraciones/:id',getVulneracionesPorAfectado);

// Vulneraciones identificadas
router.post('/vulneracion-identificada', postVulneracionIdentificada);
router.delete('/vulneracion-identificada/:id', deleteVulneracionIdentificada);
router.put('/vulneracion-identificada/:id', putVulneracionIdentificada);

router.get('/crearpdf/:id',  getAudienciaPruebasPdf);



export default router;
