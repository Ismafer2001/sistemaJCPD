import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Middleware Multer dinámico: crea carpeta por códigoTramite y subcarpeta por tipo
const storage = multer.diskStorage({
    
	destination: (req, file, cb) => {
		console.log('fileeeeeeeee:', file)
		console.log('MULTER req:', req)
        console.log('MULTER req.body:', req.body);
    console.log('MULTER req.query:', req.query);
		// Espera que el código de trámite y el tipo de carpeta vengan en el body o query
		const codigoTramite = req.body.codigoTramite || req.query.codigoTramite||'otros';
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

export const upload = multer({ 
	storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB max
	},
	fileFilter: (req, file, cb) => {
		// Permitir solo PDFs, imágenes y documentos
		const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype);
		
		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error('Solo se permiten archivos PDF, imágenes y documentos'));
		}
	}
});
