export interface usuarioAttributes {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  contrasena: string;
  rol: 'admin' | 'principal' | 'secretari@' | 'suplente';
  isactivo: boolean;
  id_canton: number;
  fecha_creacion?: Date;
}