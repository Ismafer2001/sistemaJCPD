export interface UsuarioDTO {
  usuario: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  contrasena: string;
  rol: 'admin' | 'principal' | 'secretari@' | 'suplente';
  id_canton: number;
}
