import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CierreCasoService {

  private apiUrl = 'http://localhost:3000/api/cierre-caso';

  constructor(private http: HttpClient) { }

  // Método para crear un nuevo cierre de caso
  crearCierreCaso(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  // Método para obtener un cierre de caso por ID
  obtenerDatosParaCierreCaso(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/datos/${id}`);
  }



}
