import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface Medida {
  id: number;
  medida: string;
  cuerpoLegal: string;
}

export interface ArticuloMedidas {
  id: number;
  articulo: string;
  medidas: Medida[];
}

export interface MedidasResponse {
  success: boolean;
  data: Medida[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedidasService {
  private apiUrl = `${environment.CLIENT_URL}/api/medidas`;

  constructor(private http: HttpClient) { }

  getAllMedidas(): Observable<MedidasResponse> {
    return this.http.get<MedidasResponse>(this.apiUrl);
  }
  getMedidasidentificadas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas-identificadas/${id}`);
  }
  getMedidasEmergentes(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas-emergentes/${id}`);
  }
  agregarMedidasEmergentes(medidas: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/medidas-emergentes`, medidas);
  }
   eliminarMedidasEmergentes(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/medidas-emergentes/${id}`);
  }
  actualizarMedidasEmergentes(id: number, medidas: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/medidas-emergentes/${id}`, medidas);
  }
  getMedidasDefinitivas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medidas-definitivas/${id}`);
  }
  agregarMedidasDefinitivas(medidas: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/medidas-definitivas`, medidas);
  }
  eliminarMedidasDefinitivas(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/medidas-definitivas/${id}`);
  }
  actualizarMedidasDefinitivas(id: number, medidas: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/medidas-definitivas/${id}`, medidas);
  }
}
