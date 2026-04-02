import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface Vulneracion {
  id: number;
  vulneracion: string;
  cuerpoLegal?: string | number; // Agregar propiedad para cuerpo legal
}

@Injectable({
  providedIn: 'root'
})
export class VulneracionService {
  private apiUrl = `${environment.CLIENT_URL}/api/vulneraciones`;

  constructor(private http: HttpClient) { }

  getVulneraciones(): Observable<Vulneracion[]> {
    return this.http.get<Vulneracion[]>(this.apiUrl);
  }
}
