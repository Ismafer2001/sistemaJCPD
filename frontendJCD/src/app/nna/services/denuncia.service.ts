import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Denunciante {
  cedula: number;
  nombres: string;
  apellidos: string;
  edad: number;
  genero: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
}

export interface Denuncia {
  medio: string;
  tipo_denuncia: string;
  canton: string;
  
  denunciante: Denunciante;
}

@Injectable({
  providedIn: 'root'
})
export class DenunciaService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  crearDenuncia(denuncia: Denuncia): Observable<any> {
    return this.http.post(`${this.apiUrl}/denuncias`, denuncia);
  }

  obtenerDenuncia(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/denuncias/${id}`);
  }

  actualizarDenuncia(id: string, denuncia: Denuncia): Observable<any> {
    return this.http.put(`${this.apiUrl}/denuncias/${id}`, denuncia);
  }
}

