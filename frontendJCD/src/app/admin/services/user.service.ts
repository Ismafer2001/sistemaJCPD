import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {rxResource} from '@angular/core/rxjs-interop';
import { environment } from 'environments/environment';

export interface Canton {
  id: number;
  canton: string;
}
export interface Usuario {
  id: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  isactivo: boolean;
  id_canton: number;
  canton?: Canton;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.CLIENT_URL}/api/usuarios`;

  constructor(private http: HttpClient) {}

  obtenerCantones(): Observable<Canton[]> {
  return this.http.get<Canton[]>(`${environment.CLIENT_URL}/api/cantones`);
}


  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crearUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  desactivarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/desactivar/${id}`, {});
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  usuariosActivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/activos/`);
  }
}
