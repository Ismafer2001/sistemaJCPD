import { Afectado, Denuncia, Denunciado, Denunciante } from "../models";

export interface datosDenuncia {
  denuncia: Denuncia;
  denunciante: Denunciante;
  denunciados: Denunciado[];
  afectados: Afectado[];
  vulneraciones: { idAfectado: number; vulneraciones: number[] }[];
  medidas: { idAfectado: number; medidas: number[] }[];
  
}

export interface datosDenunciaUpdate extends Partial<datosDenuncia> {
  
  
}