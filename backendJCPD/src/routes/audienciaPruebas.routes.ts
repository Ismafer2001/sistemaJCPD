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
import fs from 'fs-extra';
import path from 'path';
import { sanitizarRuta } from '../utils/sanitizar rutas';
import { supabase } from '../config/supabase';
// Vulneraciones identificadas


const router = Router();



// Obtener todos los datos completos de una audiencia de pruebas
router.get('/datosaudienciapruebacompleta/:id',verificarToken, getAudienciaPruebasCompleta);

router.get('/files/:codigoTramite/pruebas/:nombreArchivo',verificarToken, async (req, res) => {
    // 1. El JWT ya debió ser validado por un middleware previo (ej. tu verifyToken)
   try {
			  const { codigoTramite,  nombreArchivo } = req.params;
			  const storageType = process.env.STORAGE_TYPE || 'local';
	  
			  // ☁️ RUTA 1: SUPABASE (Node.js descarga el archivo y se lo pasa a Angular)
			  if (storageType === 'cloud') {
				  const rutaSupabase =sanitizarRuta(`${codigoTramite}/pruebas/${nombreArchivo}`) ;
				  console.log(rutaSupabase)
				  
				  
				  // Usamos .download() en lugar de pedir una URL
				  const { data, error } = await supabase!
					  .storage
					  .from('expedientes')
					  .download(rutaSupabase);
	  
				  if (error) throw error;
	  
				  // Convertimos el archivo (Blob) de Supabase a un formato que Express pueda enviar (Buffer)
				  const buffer = Buffer.from(await data.arrayBuffer());
				  
				  // Le decimos a Angular de qué tipo es (PDF, JPG, etc.) y se lo enviamos
				  res.type(data.type);
				  return res.send(buffer);
			  } 
			  
			  // 💻 RUTA 2: SERVIDOR LOCAL (Ubuntu)
			  else if (storageType === 'local') {
				  // Armamos la ruta física en tu servidor
				  const rutaFisica = path.join(__dirname,'..', '..', 'uploads', codigoTramite, 'pruebas', nombreArchivo);
   
				  console.log(rutaFisica)
	  
				  if (!fs.existsSync(rutaFisica)) {
					  return res.status(404).json({ mensaje: 'Archivo no encontrado en el servidor local' });
				  }
	  
				  // Enviamos el archivo físico directamente
				  return res.sendFile(rutaFisica);
			  }
	  
		  } catch (error) {
			  console.error('Error descargando archivo:', error);
			  return res.status(500).json({ mensaje: 'Error interno al procesar el archivo' });
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
