import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, } from 'rxjs';
import { login } from '../interfaces/login.interface';
import { perfil } from '@shared/interfaces/perfil.interface';
import { jwtDecode } from 'jwt-decode';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';


  constructor(private http: HttpClient, private router: Router) {}

login(user: login): Observable<{ token: string }> {
  return this.http.post<{ token: string }>(`${this.apiUrl}/login`, user).pipe(
    tap(response => {
      localStorage.setItem('token', response.token);
    })
  );
}


  getUsuarioActual() {
    return this.http.get<perfil>(`${this.apiUrl}/perfil`);

  }



  getToken(): string | null {
    return localStorage.getItem('token');
  }



 isAuthenticated(): boolean {
  const token = this.getToken();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch (error) {
    return false;
  }
}


}

