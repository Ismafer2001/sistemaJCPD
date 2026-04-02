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
      id_canton: string;
       rol: string;

}
export interface perfil {
  nombres: string;
  rol: string;
  id_canton:number
  canton: {
    canton: string;
  }

}

