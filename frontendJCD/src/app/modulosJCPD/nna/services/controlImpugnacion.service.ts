import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ControlImpugnacionService {

   private apiUrl = `${environment.CLIENT_URL}/api/control-impugnacion`;

constructor(private http: HttpClient) { }
getCodigoTramite(id: number) {
    return this.http.get<any>(`${this.apiUrl}/codigo-tramite/${id}`);
}
postControlImpugnacion(controlImpugnacion: any) {
    return this.http.post<any>(`${this.apiUrl}/`, controlImpugnacion);
}
}
