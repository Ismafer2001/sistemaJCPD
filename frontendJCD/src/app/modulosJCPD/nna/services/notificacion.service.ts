import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:3000/api/notificacion';

constructor(private http: HttpClient) { }

getInvolucradosPrincipales(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/involucrados-principales/${id}`)


}
getOtrosPrincipales(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/otros-involucrados/${id}`)


}

postCrearnotificado(otro:{}){
  return this.http.post(`${this.apiUrl}`,otro)
}

getnotificacionDTO(id: number, tipoInvolucrado?: string, idInvolucrado?: number,idNotificacion?: number): Observable<any> {
  let params = new HttpParams();

  if (tipoInvolucrado) {
    params = params.set('tipoInvolucrado', tipoInvolucrado);
  }

  if (idInvolucrado) {
    params = params.set('idInvolucrado', idInvolucrado.toString());
  }

  if (idNotificacion) {
    params = params.set('idNotificacion', idNotificacion.toString());
  }


  return this.http.get<any>(`${this.apiUrl}/notificar/${id}`, { params });
}

postNotificar(notificar: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notificacion`, notificar);
  }

  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
  }
  actualizarNotificacion(id: number, notificacion: Partial<any>): Observable<{ success: boolean; message: string }> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, notificacion);
    }

getNotificacionEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notificacion-completa/${id}`);
  }

  // Eliminar otro notificado
  deleteOtroNotificado(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/otros/${id}`);
  }

  // Actualizar otro notificado
  putOtroNotificado(id: number, otroNotificado: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/otros/${id}`, otroNotificado);
  }




}
