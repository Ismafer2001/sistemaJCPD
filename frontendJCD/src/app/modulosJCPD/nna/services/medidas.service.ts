import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Medida {
  id: number;
  medida: string;
}

export interface ArticuloMedidas {
  id: number;
  articulo: string;
  medidas: Medida[];
}

export interface MedidasResponse {
  success: boolean;
  data: ArticuloMedidas[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedidasService {
  private apiUrl = 'http://localhost:3000/api/medidas';

  constructor(private http: HttpClient) { }

  getAllMedidas(): Observable<MedidasResponse> {
    return this.http.get<MedidasResponse>(this.apiUrl);
  }
}
