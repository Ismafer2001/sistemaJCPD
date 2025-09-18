

export interface login{
    id?: number; 
    nombres: string;
    usuario: string;
    contrasena: string;
    rol: string;
    id_canton: number
}
export interface jwtpayload {
  id: number;
  nombres: string;
  usuario: string;
  rol: string;
  canton?: string;
  id_canton: number;
}