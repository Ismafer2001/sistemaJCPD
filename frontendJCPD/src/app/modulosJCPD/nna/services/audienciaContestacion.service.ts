import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AudienciaContestacionService {
  private apiUrl = `${environment.CLIENT_URL}/api/audiencia-contestacion`;
  constructor(private http: HttpClient) { }


  getAfectadosYDirigidoA(idDenuncia: number) {
    // Ajusta la URL según tu backend
    return this.http.get<any>(`${this.apiUrl}/afectados-dirigidoA/${idDenuncia}`);
  }

  postCrearParticipante(participante: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/afectados-dirigidoA`, participante);
  }

  getDatosAudiencia(idDenuncia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/datos-audiencia/${idDenuncia}`);
  }

   postaudienciaContestacion(audienciaContestacion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, audienciaContestacion);
  }
  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
  }
  actualizarAudienciaContestacion(id: number, audienciaContestacion: Partial<any>): Observable<{ success: boolean; message: string }> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, audienciaContestacion);
    }
    getAudienciaContestacionEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Datosaudienciacompleta/${id}`);
  }

}
