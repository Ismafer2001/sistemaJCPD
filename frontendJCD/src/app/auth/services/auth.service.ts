import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  obtenerUsuario() {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  }

  estaAutenticado(): boolean {
    return !!this.obtenerUsuario();
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
  }

  esAdmin(): boolean {
    return this.obtenerUsuario()?.rol === 'admin';
  }

  esUsuario(): boolean {
    return this.obtenerUsuario()?.rol !== 'admin';
  }
}

