import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResolucionesService {
  private apiUrl = `${environment.CLIENT_URL}/api/resoluciones`;

constructor(private http: HttpClient) { }

getAfectados(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/afectados/${id}`);
  }
  getresolucion(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resolucion-denuncia/${id}`);
  }

  postResolucion(resoluciones: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, resoluciones);
  }

  getResolucionEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resolucion-completa/${id}`);
  }
  actualizarResolucion(id: number, resolucion: Partial<any>): Observable<{ success: boolean; message: string }> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, resolucion);
    }




  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
  }


}
