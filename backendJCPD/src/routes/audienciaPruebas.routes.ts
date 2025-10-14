import { Router } from 'express';
import {
		postAudienciaPruebas,
		putAudienciaPruebas,
		getAudienciaPruebasDTO,
		getParticipantesAudienciaContestacionCtrl,
		postAgregarOtrosParticipantes,
		getMedidasEmergentesPorAfectado,
		getVulneracionesPorAfectado,
		postVulneracionIdentificada,
		deleteVulneracionIdentificada,
		putVulneracionIdentificada
	} from '../controllers/audienciaPruebas.controller';
// Vulneraciones identificadas


const router = Router();


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
router.get('/medidas/:id',getMedidasEmergentesPorAfectado);
//obtener vulneraciones identificadas por afectado
router.get('/vulneraciones/:id',getVulneracionesPorAfectado);

// Vulneraciones identificadas
router.post('/vulneracion-identificada', postVulneracionIdentificada);
router.delete('/vulneracion-identificada/:id', deleteVulneracionIdentificada);
router.put('/vulneracion-identificada/:id', putVulneracionIdentificada);



export default router;
