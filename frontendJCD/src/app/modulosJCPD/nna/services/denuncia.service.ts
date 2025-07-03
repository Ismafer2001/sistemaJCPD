import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Denuncia } from '@nna/interfaces/denuncia.interface';



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

