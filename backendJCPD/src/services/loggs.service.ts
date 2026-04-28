// services/audit.service.ts
import { loggsDTOInterfaces } from "../interfaces/loggs.interface";
import { Loggs } from "../models/loggs.models";




export async function RegistrarLoggs(loggsData:loggsDTOInterfaces){
  try {
    console.log('entrando en auditoria')
    await Loggs.create({
        idUsuario: loggsData.idUsuario,
      usuario: loggsData.usuario,
      nombres: loggsData.nombres,
      fase: loggsData.fase,
      accion: loggsData.accion,
      descripcion: loggsData.descripcion,
      canton: loggsData.canton
      
    });
  } catch (error) {
    console.error("Error guardando el log de auditoría", error);
  }
};