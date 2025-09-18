import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudienciaContestacionService {
  private apiUrl = 'http://localhost:3000/api/audiencia-contestacion';
  constructor(private http: HttpClient) { }


  getAfectadosYDirigidoA(idDenuncia: number) {
    // Ajusta la URL según tu backend
    return this.http.get<any>(`${this.apiUrl}/afectados-dirigidoA/${idDenuncia}`);
  }
  getRepresentantes(idDenuncia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/representantes-institucionales/${idDenuncia}`);
  }
  postCrearParticipante(participante: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/afectados-dirigidoA`, participante);
  }
  postCrearRepresentante(representante: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/representantes-institucionales`, representante);
  }
  getDatosAudiencia(idDenuncia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/datos-audiencia/${idDenuncia}`);
  }

}
