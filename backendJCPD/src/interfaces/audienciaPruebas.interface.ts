
import { AudienciaPruebasAttributes, AudienciaPruebasCreationAttributes } from "../models/audiencia_prueba.model";
import { ParticipantesAudienciaPruebasCreationAttributes } from "../models/participantes_audiencia_pruebas.model";
import { TestimonioCreationAttributes } from "../models/testimonios.models";

export interface participantesAudienciaPruebasDTOS extends TestimonioCreationAttributes,ParticipantesAudienciaPruebasCreationAttributes {
    
    archivoCrudo:Express.Multer.File;
  
}
export interface participantesAudienciaPruebasDTOSActualizar extends Partial<participantesAudienciaPruebasDTOS> {
    
    archivoCrudo:Express.Multer.File;
    pathPruebasConservado:any;
  
}
export interface participantesAudienciaPruebasexistentesDTOSActualizar extends Partial<participantesAudienciaPruebasDTOS> {
    
    
  
}




export interface AudienciaPruebasDTOS extends AudienciaPruebasCreationAttributes{
    participantes:participantesAudienciaPruebasDTOS[]
  
}

export interface AudienciaPruebasDTOSActualizar extends Partial<AudienciaPruebasCreationAttributes>{
    participantes:participantesAudienciaPruebasDTOSActualizar[]
    
  
}
