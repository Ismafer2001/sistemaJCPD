import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
   private socket: Socket | null = null;

  constructor() {}

  // Conectar al servidor Socket.IO con el ID del cantón del usuario
  conectar(idCanton: number): void {
    // Solo conectar si no hay conexión activa
    if (this.socket?.connected) {
      console.log('⚠️ Socket ya está conectado, saltando nueva conexión');
      return;
    }

    

    this.socket = io(environment.CLIENT_URL, {
      query: {
        id_canton: idCanton.toString() // Convierte a string
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO con ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado del servidor Socket.IO. Razón:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Error de conexión Socket.IO:', error);
    });
  }

  // Escuchar notificaciones de nuevos casos remitidos
  escucharNuevosCasos(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket no conectado');
        return;
      }

      this.socket.on('nuevo_caso_remitido', (datos: any) => {
        console.log('📩 Nueva notificación recibida:', datos);
        observer.next(datos);
      });

      // Cleanup cuando se desuscribe
      return () => {
        this.socket?.off('nuevo_caso_remitido');
      };
    });
  }

  // Desconectar del socket
  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
