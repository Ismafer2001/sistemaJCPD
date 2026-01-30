import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformesService {
  private apiUrl = 'http://localhost:3000/api/informes';

  constructor(private http: HttpClient) { }

  // POST / - Crear un nuevo informe
  crearInforme(informe: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, informe);
  }

  // GET /informes/:idDenuncia - Obtener informes por denuncia
  obtenerInformesPorDenuncia(idDenuncia: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/informes/${idDenuncia}`);
  }

  // GET /datosinforme/:idDenuncia - Obtener datos para crear un informe
  obtenerDatosParaInforme(idDenuncia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/datosinforme/${idDenuncia}`);
  }

  // GET /informe-completo/:id - Obtener un informe completo por ID
  obtenerInformePorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/informe-completo/${id}`);
  }
}
