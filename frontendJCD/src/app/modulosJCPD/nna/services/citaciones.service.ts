import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitacionesService {
  private apiUrl = 'http://localhost:3000/api/citacion/';

  constructor(private http: HttpClient) {}

  getinvolucradosCitaciones(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}involucrados-principales/${id}`);
  }
  getOtrosInvolucrados(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}otros-involucrados/${id}`)


}
postCrearCitados(otro:{}){
  return this.http.post(`${this.apiUrl}`,otro)
}
 // Eliminar otro notificado
  deleteOtroCitado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}otros/${id}`);
  }

  // Actualizar otro notificado
  putOtroCitado(id: number, otroNotificado: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}otros/${id}`, otroNotificado);
  }

  getcitacioenesDTO(id: number, tipoInvolucrado?: string, idInvolucrado?: number,idCitacion?: number): Observable<any> {
    let params = new HttpParams();

  if (tipoInvolucrado) {
    params = params.set('tipoInvolucrado', tipoInvolucrado);
  }

  if (idInvolucrado) {
    params = params.set('idInvolucrado', idInvolucrado.toString());
  }

  if (idCitacion) {
    params = params.set('idCitacion', idCitacion.toString());
  }

  console.log('Parametros enviados:', params.toString());
    return this.http.get<any>(`${this.apiUrl}citar/${id}`, { params });
  }
  postCitar(citar: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}citacion`, citar);
  }
  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}crearpdf/${id}`, { responseType: 'blob' });
  }
  actualizarCitacion(id: number, citacion: Partial<any>): Observable<{ success: boolean; message: string }> {
      return this.http.put<any>(`${this.apiUrl}${id}`, citacion);
    }

    getCitacionEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}datoscitacion/${id}`);
    }

}
