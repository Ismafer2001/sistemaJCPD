import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    usuario: string;
    rol: string;
    id_canton: number;
    nombres: string;
    apellidos: string;
    correo: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private usuarioActual = new BehaviorSubject<LoginResponse['usuario'] | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(usuario: string, contrasena: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { usuario, contrasena })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          this.usuarioActual.next(response.usuario);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioActual.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): LoginResponse['usuario'] | null {
    return this.usuarioActual.value || JSON.parse(localStorage.getItem('usuario') || 'null');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  tieneRol(rol: string): boolean {
    return this.getUsuario()?.rol === rol;
  }
}

