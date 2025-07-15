export interface login{
  usuario: string;
  contrasena: string;
  recordar?: boolean;
}
 export interface JwtPayload {
      id: number,
      nombres: string,
      usuario: string,
      canton: string
       rol: string;

}
