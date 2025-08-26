import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitacionesService {
  private apiUrl = 'http://localhost:3000/api/citacion/';

constructor(private http: HttpClient) { }

getinvolucradosCitaciones(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}${id}`)

}


getcitacioenesDTO(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}citar/${id}`)

}
postCitar(citar: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, citar);
  }




}
