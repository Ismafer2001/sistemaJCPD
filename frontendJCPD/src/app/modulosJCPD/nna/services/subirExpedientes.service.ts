import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubirExpedientesService {
  private apiUrl = `${environment.CLIENT_URL}/api/expedientes`;

constructor(private http: HttpClient) { }

 uploadArchivo(data: any, codigoTramite: string, tipoCarpeta: string): Observable<any> {

    const params = new HttpParams()
      .set('codigoTramite', codigoTramite)
      .set('tipoCarpeta', tipoCarpeta);

    return this.http.post(`${this.apiUrl}`, data, { params });
  }

  updateArchivo(data: any, codigoTramite: string, tipoCarpeta: string,id: number): Observable<any> {

    const params = new HttpParams()
      .set('codigoTramite', codigoTramite)
      .set('tipoCarpeta', tipoCarpeta);

    return this.http.put(`${this.apiUrl}/${id}`, data, { params });
  }

  getArchivos(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


  descargarArchivoSeguro(codigoTramite: string, nombreArchivo: string, tipoCarpeta: string) {
  const url = `${this.apiUrl}/files/${codigoTramite}/${tipoCarpeta}/${nombreArchivo}`;

  // Usamos responseType: 'blob' para recibir el archivo binario
  return this.http.get(url, { responseType: 'blob' });
}



}
