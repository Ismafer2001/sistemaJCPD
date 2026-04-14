import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnexarSeguimientoMedidasService {
  private apiUrl = `${environment.CLIENT_URL}/api/seguimiento-medidas`;


constructor(private http: HttpClient) { }

getAfectados(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/afectados/${id}`);
  }

   uploadArchivo(data: any, codigoTramite: string, tipoCarpeta: string): Observable<any> {

    const params = new HttpParams()
      .set('codigoTramite', codigoTramite)
      .set('tipoCarpeta', tipoCarpeta);

    return this.http.post(`${this.apiUrl}/cumplimiento-medidas`, data, { params });
  }


  getMedidasporCumplir(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas-pendientes/${id}`);
  }
  getMedidasDeAfectados(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas-definitivas/${id}`);
  }

  getMedidasCumplidas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas-cumplidas/${id}`);
  }

  // En tu servicio de archivos
descargarArchivoSeguro(codigoTramite: string, nombreArchivo: string) {
  const url = `${this.apiUrl}/files/${codigoTramite}/seguimiento/${nombreArchivo}`;

  // Usamos responseType: 'blob' para recibir el archivo binario
  return this.http.get(url, { responseType: 'blob' });
}

 updateseguimiento(data: any, codigoTramite: string, tipoCarpeta: string): Observable<any> {

    const params = new HttpParams()
      .set('codigoTramite', codigoTramite)
      .set('tipoCarpeta', tipoCarpeta);

    return this.http.put(`${this.apiUrl}/cumplimiento-medidas`, data, { params });
  }





}
