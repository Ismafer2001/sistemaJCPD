import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface AuthErrorData {
  type: '401' | '403';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorModalService {
  private authErrorSubject = new Subject<AuthErrorData | null>();

  authError$: Observable<AuthErrorData | null> = this.authErrorSubject.asObservable();

  show403Modal(serverMessage?: string) {
    this.authErrorSubject.next({
      type: '403',
      title: 'Acceso Denegado',
      message: serverMessage || 'No tienes los permisos necesarios para acceder a esta sección. Por favor, contacta al administrador del sistema.'
    });
  }

  show401Modal(serverMessage?: string) {
    this.authErrorSubject.next({
      type: '401',
      title: 'Sesión Expirada',
      message: serverMessage || 'Tu sesión ha expirado o no estás autenticado. Por favor, inicia sesión nuevamente.'
    });
  }

  closeModal() {
    this.authErrorSubject.next(null);
  }
}
