import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vulneracion {
  id: number;
  vulneracion: string;

}

@Injectable({
  providedIn: 'root'
})
export class VulneracionService {
  private apiUrl = 'http://localhost:3000/api/vulneraciones';

  constructor(private http: HttpClient) { }

  getVulneraciones(): Observable<Vulneracion[]> {
    return this.http.get<Vulneracion[]>(this.apiUrl);
  }
}
