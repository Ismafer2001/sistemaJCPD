import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
export interface Canton {
  id: number;
  canton: string;
}

@Injectable({
  providedIn: 'root'
})
export class InhibirseService {
   private apiUrl = `${environment.CLIENT_URL}/api/inhibirse`;

constructor(private http: HttpClient) { }

 obtenerCantones(): Observable<Canton[]> {
  return this.http.get<Canton[]>(`${environment.CLIENT_URL}/api/cantones`);
}
IniciarInhibirse(inhibirse: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, inhibirse);
  }

getCodigoTramite(id: number) {
    return this.http.get<any>(`${this.apiUrl}/codigo-tramite/${id}`);
}
getDeprecatorias(idCanton: number) {
    return this.http.get<any>(`${this.apiUrl}/deprecatorias/${idCanton}`);
}

getDeprecatoriasById(idDeprecatoria: number) {
    return this.http.get<any>(`${this.apiUrl}/${idDeprecatoria}`);
}
putAceptarDeprecatoria(idDeprecatoria: number) {
    return this.http.put<any>(`${this.apiUrl}/${idDeprecatoria}/aceptar`, {});
}

}

