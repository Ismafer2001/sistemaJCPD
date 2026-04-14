import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AvocatoriaService {
  private apiUrl = `${environment.CLIENT_URL}/api/avocatoria`;
  private apiUrlUpload = `${environment.CLIENT_URL}/api/upload/upload`;

  constructor(private http: HttpClient) { }

  obtenerDenunciaParaAvocatoria(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getMedidasIdentificadas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas/${id}`);
  }

  getAfectados(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/afectados/${id}`);
  }
  postAvocatoria(avocatoria: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registrar-avocatoria`, avocatoria);
  }
  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
  }
  actualizarAvocatoria(id: number, avocatoria: Partial<any>): Observable<{ success: boolean; message: string }> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, avocatoria);
    }
 getAvocatoriaEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/avocatoria-completa/${id}`);
  }



  uploadArchivo(archivo: File, codigoTramite: string, tipoCarpeta: string): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const params = new HttpParams()
      .set('codigoTramite', codigoTramite)
      .set('tipoCarpeta', tipoCarpeta);

    return this.http.post(this.apiUrlUpload, formData, { params });
  }
}

