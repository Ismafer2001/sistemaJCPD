import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class FasesService {
  private apiUrl = `${environment.CLIENT_URL}/api/estatus/`;

constructor(private http:HttpClient ) { }
getEstatus(id:number){
  return this.http.get<any>(`${this.apiUrl}${id}`)}


}
