import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DesestimientoService {
   private apiUrl = `${environment.CLIENT_URL}/api/desestimiento`;

constructor(private http:HttpClient) { }

getCodigoTramite(id: number) {
    return this.http.get<any>(`${this.apiUrl}/codigo-tramite/${id}`);
}
postControlDesestimiento(controlDesestimiento: any) {
    return this.http.post<any>(`${this.apiUrl}/`, controlDesestimiento);
}


}
