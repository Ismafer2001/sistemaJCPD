import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InformesService {
  private apiUrl = `${environment.CLIENT_URL}/api/informes`;

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
  actualizarInforme(id: number, informe: Partial<any>): Observable<{ success: boolean; message: string }> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, informe);
      }
  crearpdfBlob(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
      }
}
