export interface Denuncia {
  idDenuncia: number;
  medio: string;
  id_canton:number;
  tipo_denuncia: string;
  canton: string;
  fecha_creado: string;
  estado: string;
  afectados: Afectado[];
  denunciado:Denunciado[];
  denunciante: Denunciante;
}
export interface Denunciante {
  cedula: number;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  genero: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;

}

export interface Afectado {
  cedula: number;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  genero: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
  medidas: number[];
  vulneraciones: number[];
}
export interface Denunciado {
  cedula: number;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  genero: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
  parentesco:string;
}

