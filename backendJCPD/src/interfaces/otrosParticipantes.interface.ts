import { OtrosAttributes } from "../models/Otros.models";

export interface otrosAudienciaContDTOS extends Partial<OtrosAttributes>{
  nombres: string;
  apellidos: string;
  cedula: string;
  tipoParticipante: string;
  idDenuncia: number;
  nombre_proyecto: string;
  cargo: string;
  institucion: string;
}
export interface otrosAudienciaPruetDTOS extends Partial<OtrosAttributes>{
  nombres: string;
  apellidos: string;
  cedula: string;
  tipoParticipante: string;
  idDenuncia: number;
}