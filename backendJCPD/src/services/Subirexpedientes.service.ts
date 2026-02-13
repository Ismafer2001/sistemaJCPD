import { Expediente } from '../models/expedientes.models';
import fs from 'fs';
import path from 'path';


// Servicio para guardar expediente subido
// Espera req.file (de multer) y body con idDenuncia y tipoExpediente
export async function guardarExpediente({ file, idDenuncia, tipoExpediente }: {
  file: Express.Multer.File,
  idDenuncia: number,
  tipoExpediente: string
}) {
  if (!file) throw new Error('Archivo requerido');
  if (!idDenuncia) throw new Error('idDenuncia requerido');
  if (!tipoExpediente) throw new Error('tipoExpediente requerido');

  const expediente = await Expediente.create({
    idDenuncia,
    pathExpediente: file.path,
    filename: file.filename,
    tipoExpediente
  });
  return expediente;
}

// Obtener expedientes por idDenuncia
export async function obtenerExpedientesPorDenuncia(idDenuncia: number) {
  return await Expediente.findAll({
    where: { idDenuncia }
  });
}








// Actualizar expediente existente
export async function actualizarExpediente({ idExpediente, file, idDenuncia, tipoExpediente }: {
  idExpediente: number,
  file?: Express.Multer.File,
  idDenuncia?: number,
  tipoExpediente?: string
}) {
  try {
    const updateData: any = {};
    let expedienteAnterior: any = null;
    if (file) {
      // Buscar expediente anterior para eliminar el archivo viejo
      expedienteAnterior = await Expediente.findByPk(idExpediente);
      if (expedienteAnterior && expedienteAnterior.pathExpediente) {
        try {
          if (fs.existsSync(expedienteAnterior.pathExpediente)) {
            fs.unlinkSync(expedienteAnterior.pathExpediente);
          }
        } catch (err) {
          // No detener el flujo si no se puede borrar, pero loguear
          console.error('No se pudo eliminar el archivo anterior:', err);
        }
      }
      updateData.filename = file.filename;
      updateData.pathExpediente = file.path;
    }
    if (idDenuncia !== undefined) {
      updateData.idDenuncia = idDenuncia;
    }
    if (tipoExpediente !== undefined) {
      updateData.tipoExpediente = tipoExpediente;
    }
    const [updatedRows] = await Expediente.update(updateData, {
      where: { id: idExpediente },
      returning: true
    });
    if (updatedRows === 0) {
      throw new Error('Expediente no encontrado');
    }
    const expedienteActualizado = await Expediente.findByPk(idExpediente);
    return expedienteActualizado;
  } catch (error) {
    throw error;
  }
}






