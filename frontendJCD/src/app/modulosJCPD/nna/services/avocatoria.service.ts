import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvocatoriaService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  obtenerDenunciaParaAvocatoria(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/avocatoria/${id}`);
  }
  getMedidasIdentificadas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/avocatoria/medidas/${id}`);
  }
}
