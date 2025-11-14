import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnexarSeguimientoMedidasService {
  private apiUrl = 'http://localhost:3000/api/seguimiento-medidas';

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

  getMedidasCumplidas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas-cumplidas/${id}`);
  }





}
