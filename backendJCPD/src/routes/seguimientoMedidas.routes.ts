import { Router } from 'express';
import { getAfectadosSeguimientoMedidas, postAgregarCumplimientoMedidas, putActualizarCumplimientoMedidas, getMedidasPendientesPorAfectado, getMedidasCumplidasPorAfectado, getMedidasDefinitivasPorAfectado } from '../controllers/seguimientoMedidas.controller';
import { upload } from '../middleware/multer.middleware';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';
import { supabase } from '../config/supabase';
import fs from 'fs-extra';
import path from 'path';
import { sanitizarRuta } from '../utils/sanitizar rutas';

const router = Router();
// Rutas protegidas - requieren autenticación
router.use(verificarToken);

router.get('/files/:codigoTramite/seguimiento/:nombreArchivo', async(req, res) => {
    // 1. El JWT ya debió ser validado por un middleware previo (ej. tu verifyToken)
    // 2. Extraemos los datos del token que ya tienes (canton, rol, etc.)
   try {
           const { codigoTramite,  nombreArchivo } = req.params;
           const storageType = process.env.STORAGE_TYPE || 'local';
   
           // ☁️ RUTA 1: SUPABASE (Node.js descarga el archivo y se lo pasa a Angular)
           if (storageType === 'cloud') {
               const rutaSupabase =sanitizarRuta(`${codigoTramite}/seguimiento/${nombreArchivo}`) ;
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
               const rutaFisica = path.join(__dirname,'..', '..', 'uploads', codigoTramite, 'seguimiento', nombreArchivo);

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

router.get('/afectados/:id', getAfectadosSeguimientoMedidas);
router.get('/medidas-definitivas/:idAfectado', getMedidasDefinitivasPorAfectado);
router.get('/medidas-pendientes/:idAfectado', getMedidasPendientesPorAfectado);
router.get('/medidas-cumplidas/:idAfectado', getMedidasCumplidasPorAfectado);
router.post('/cumplimiento-medidas',  upload.single('archivo'), postAgregarCumplimientoMedidas);
router.put('/cumplimiento-medidas',  upload.single('archivo'), putActualizarCumplimientoMedidas);






export default router;