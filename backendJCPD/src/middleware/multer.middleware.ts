import multer from 'multer';
import path from 'path';

// 1. Cambiamos diskStorage por memoryStorage
// Ahora el archivo se queda un momento en la RAM como un "buffer"
const storage = multer.memoryStorage();

export const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
        // Mantenemos tu validación de tipos
        const allowedTypes = /pdf|jpg|jpeg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF e imágenes'));
        }
    }
});