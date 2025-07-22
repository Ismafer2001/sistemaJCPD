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
  eliminarDenuncia(id:number ): Observable<any>{

    return this.http.delete(`${this.apiUrl}/denuncias/${id}`)
  }

  obtenerDenuncia(id: number): Observable<Denuncia> {
    return this.http.get<Denuncia>(`${this.apiUrl}/denuncias/${id}`);
  }

  obtenerNumTramite(incrementar=false):Observable<{ numero: number }>{
    return this.http.get<{ numero: number }>(`${this.apiUrl}/denuncias/num_tramite`,{params:{incrementar}
    })

  }
   contarDenunciasActivas(): Observable<{total:number}>{
    return this.http.get<{total: number}>(`${this.apiUrl}/denuncias/countdenunciasActivas`)
   }

  obtenerTodasDenuncias(): Observable<Denuncia[]> {
    return this.http.get<Denuncia[]>(`${this.apiUrl}/denuncias`);
  }

  actualizarDenuncia(id: string, denuncia: Partial<Denuncia>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/denuncias/${id}`, denuncia);
  }
}

