import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudienciaPruebasService {
 private apiUrl = 'http://localhost:3000/api/audiencia-pruebas';
  constructor(private http: HttpClient) { }

}
