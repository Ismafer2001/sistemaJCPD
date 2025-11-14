import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:3000/api/notificacion';

constructor(private http: HttpClient) { }

getinvolucrados(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/${id}`)

}

postCrearnotificado(otro:{}){
  return this.http.post(`${this.apiUrl}`,otro)
}
getnotificacionDTO(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/notificar/${id}`)

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




}
