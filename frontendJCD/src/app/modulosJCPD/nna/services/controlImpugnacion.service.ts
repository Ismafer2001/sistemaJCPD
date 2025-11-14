import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ControlImpugnacionService {

   private apiUrl = 'http://localhost:3000/api/control-impugnacion';

constructor(private http: HttpClient) { }
getCodigoTramite(id: number) {
    return this.http.get<any>(`${this.apiUrl}/codigo-tramite/${id}`);
}
postControlImpugnacion(controlImpugnacion: any) {
    return this.http.post<any>(`${this.apiUrl}/`, controlImpugnacion);
}
}
