import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResolucionesService {
  private apiUrl = 'http://localhost:3000/api/resoluciones';

constructor(private http: HttpClient) { }

getAfectados(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/afectados/${id}`);
  }

  postResolucion(resoluciones: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, resoluciones);
  }


}
