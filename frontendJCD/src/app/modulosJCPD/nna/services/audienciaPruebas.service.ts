import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudienciaPruebasService {
 private apiUrl = 'http://localhost:3000/api/audiencia-pruebas';
  constructor(private http: HttpClient) { }

   getParticipantesAudiencia(idDenuncia: number) {
    // Ajusta la URL según tu backend
    return this.http.get<any>(`${this.apiUrl}/participantes-audiencia-prueba/${idDenuncia}`);
  }

  postCrearParticipante(participante: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/agregar-participante`, participante);
  }

  getDatosAudiencia(idDenuncia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/datos-audiencia-prueba/${idDenuncia}`);
  }

   postaudienciaPrueba(audienciaPrueba: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, audienciaPrueba);
  }

  getMedidasEmergentes(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas/${id}`);
  }
  getVulneracionesIdentificadas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vulneraciones/${id}`);
  }
  agregarVulneracionIdentificada(vulneracion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vulneracion-identificada`, vulneracion);
  }
  eliminarVulneracionIdentificada(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/vulneracion-identificada/${id}`);
  }
  actualizarVulneracionIdentificada(id: number, vulneracion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vulneracion-identificada/${id}`, vulneracion);
  }

  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
  }
  actualizarAudienciaPrueba(id: number, audienciaPrueba: Partial<any>): Observable<{ success: boolean; message: string }> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, audienciaPrueba);
    }


}
