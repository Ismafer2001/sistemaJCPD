import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, } from 'rxjs';
import { login } from '../interfaces/login.interface';
import { perfil } from '@shared/interfaces/perfil.interface';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';


  constructor(private http: HttpClient, private router: Router) {}

  login(user:login): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/login`, user )

  }

  getUsuarioActual() {
    return this.http.get<perfil>(`${this.apiUrl}/perfil`);

  }



  getToken(): string | null {
    return localStorage.getItem('token');
  }



  isAuthenticated(): boolean {
    return !!this.getToken();
  }


}

