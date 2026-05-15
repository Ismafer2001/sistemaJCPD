import { Router } from 'express';

import { verificarToken } from '../middleware/auth.middleware';
import { verificarCantonDenuncia } from '../middleware/canton.middleware';

import { supabase } from '../config/supabase';
import fs from 'fs-extra';
import path from 'path';
import { sanitizarRuta } from '../utils/sanitizar rutas';
const router = Router();
// Nota que aquí usamos router.get en lugar de app.get
router.get('/:codigoTramite/:tipoCarpeta/:nombreArchivo', verificarToken, async (req, res) => {
    try {
        const { codigoTramite, tipoCarpeta, nombreArchivo } = req.params;
        const storageType = process.env.STORAGE_TYPE || 'local';

        // ☁️ RUTA 1: SUPABASE (Node.js descarga el archivo y se lo pasa a Angular)
        if (storageType === 'cloud') {
            const rutaSupabase =sanitizarRuta(`${codigoTramite}/${tipoCarpeta}/${nombreArchivo}`) ;
            
            
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
            const rutaFisica = path.join(__dirname, codigoTramite, tipoCarpeta, nombreArchivo);

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


export default router;