export interface RegistrarUsuarioDTOS {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  rol: "admin" | "principal" | "secretari@" | "suplente";
  isactivo: boolean;
  id_canton: number;
  fecha_creacion?: Date;
}

export interface jwtpayload {
  id: number;
  nombres: string;
  usuario: string;
  rol: string;
  canton?: string;
  id_canton: number;
}
