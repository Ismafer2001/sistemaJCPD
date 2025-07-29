import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitacionesService {
  private apiUrl = 'http://localhost:3000/api';

constructor(private http: HttpClient) { }

getinvolucradosCitaciones(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/citacion/${id}`)

}


getcitacioenesDTO(id:number): Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/citacion/citar/${id}`)

}




}
