import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Middleware Multer dinámico: crea carpeta por códigoTramite y subcarpeta por tipo
const storage = multer.diskStorage({
    
	destination: (req, file, cb) => {
        console.log('MULTER req.body:', req.body);
    console.log('MULTER req.query:', req.query);
		// Espera que el código de trámite y el tipo de carpeta vengan en el body o query
		const codigoTramite = req.body.codigoTramite || req.query.codigoTramite;
		const tipoCarpeta = req.body.tipoCarpeta || req.query.tipoCarpeta || 'otros';
		if (!codigoTramite) {
			return cb(new Error('Falta el código de trámite'), '');
		}
		// Carpeta base
		const baseDir = path.resolve('uploads', codigoTramite, tipoCarpeta);
		// Crear la carpeta si no existe
		fs.mkdirSync(baseDir, { recursive: true });
		cb(null, baseDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	}
});

export const upload = multer({ storage });
