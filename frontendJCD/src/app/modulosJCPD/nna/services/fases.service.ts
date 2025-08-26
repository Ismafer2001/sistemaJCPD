import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FasesService {
  private apiUrl = 'http://localhost:3000/api/estatus/';

constructor(private http:HttpClient ) { }
getEstatus(id:number){
  return this.http.get<any>(`${this.apiUrl}${id}`)}


}
