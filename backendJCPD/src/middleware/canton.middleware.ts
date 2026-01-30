import { Request, Response, NextFunction } from 'express';
import { usuarios } from '../models/usuarios.models';
import { Canton } from '../models/cantones.models';
import { Denuncia } from '../models/denuncia.models';

// Extender el tipo Request para incluir información del usuario y cantón



/**
 * Middleware específico para rutas de denuncias
 * Verifica que el usuario tenga acceso al cantón de la denuncia
 */
export const verificarCantonDenuncia = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    const usuario = await usuarios.findByPk(req.user.id, {
      include: [{
        model: Canton,
        as: 'Canton'
      }]
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

  

    // Obtener ID de denuncia de los parámetros
    const idDenuncia = req.params.id || req.params.idDenuncia || req.body.idDenuncia;

    console.log("ID Denuncia en middleware:", idDenuncia);
    
    if (!idDenuncia) {
      // Si no hay ID de denuncia, verificar cantón desde el body para creación
      if (req.body.idCantonOrigen) {
        if (usuario.id_canton !== req.body.idCantonOrigen) {
          res.status(403).json({
            success: false,
            message: 'No tiene permisos para crear denuncias en este cantón'
          });
          return;
        }
      }
      next();
      return;
    }

    // Verificar cantón de la denuncia existente
    const denuncia = await Denuncia.findByPk(idDenuncia, {
      attributes: ['id', 'id_canton'],
      
    });

    if (!denuncia) {
      res.status(404).json({
        success: false,
        message: 'Denuncia no encontrada'
      });
      return;
    }

    if (usuario.id_canton !== denuncia.id_canton) {
      res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a esta denuncia'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error en middleware de verificación de cantón de denuncia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};


