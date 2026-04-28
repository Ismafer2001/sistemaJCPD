export interface RegistrarUsuarioDTOS {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  rol: "admin" | "principal" | "secretaria" | "suplente";
  isactivo: boolean;
  id_canton: number;
  fecha_creacion?: Date;
}
export interface usuarioUpdate extends Partial<RegistrarUsuarioDTOS> {

  
  
}


