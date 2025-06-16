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

export interface Afectado {
  nombre: string;
  apellido: string;
}

export interface Denuncia {
  id: number;
  medio: string;
  tipo_denuncia: string;
  canton: string;
  fecha_creado: string;
  estado: string;
  afectados: Afectado[];
  denunciante: Denunciante;
}

@Injectable({
  providedIn: 'root'
})
export class DenunciaService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  crearDenuncia(denuncia: Omit<Denuncia, 'id'>): Observable<{ success: boolean; message: string; data: { id: number } }> {
    return this.http.post<{ success: boolean; message: string; data: { id: number } }>(`${this.apiUrl}/denuncias`, denuncia);
  }

  obtenerDenuncia(id: string): Observable<Denuncia> {
    return this.http.get<Denuncia>(`${this.apiUrl}/denuncias/${id}`);
  }

  obtenerTodasDenuncias(): Observable<Denuncia[]> {
    return this.http.get<Denuncia[]>(`${this.apiUrl}/denuncias`);
  }

  actualizarDenuncia(id: string, denuncia: Partial<Denuncia>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/denuncias/${id}`, denuncia);
  }
}

