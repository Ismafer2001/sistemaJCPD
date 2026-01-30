import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesestimientoService {
   private apiUrl = 'http://localhost:3000/api/desestimiento';

constructor(private http:HttpClient) { }

getCodigoTramite(id: number) {
    return this.http.get<any>(`${this.apiUrl}/codigo-tramite/${id}`);
}
postControlDesestimiento(controlDesestimiento: any) {
    return this.http.post<any>(`${this.apiUrl}/`, controlDesestimiento);
}


}
