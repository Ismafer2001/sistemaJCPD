import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvidenciaService {
  private apiUrl = `${environment.CLIENT_URL}/api/providencias`;

constructor(private http:HttpClient) { }

postprovidencia(providencia: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, providencia);
  }

  getProvidenciaEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/providencia-completa/${id}`);
  }

  getIdProvidencia(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/id-providencia/${id}`);
  }
  actualizarProvidencia(id: number, providencia: Partial<any>): Observable<{ success: boolean; message: string }> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, providencia);
    }
     crearpdfBlob(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
      }

}
