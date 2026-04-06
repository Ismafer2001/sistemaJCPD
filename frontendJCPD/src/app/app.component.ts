
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ModalAccesoDenegadoComponent } from '@shared/components/modalAccesoDenegado/modalAccesoDenegado.component';
import { WebSocketService } from '@shared/services/web-socket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';


@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster, ModalAccesoDenegadoComponent],

  templateUrl: './app.component.html',

})
export class AppComponent implements OnInit, OnDestroy {
  notificaciones: any[] = [];
  private notificacionSub?: Subscription;

  constructor(
    private socketService: WebSocketService,
    private authService: AuthService
  ) {}

 ngOnInit(): void {
 console.log("iniciando appcomponent")
    //  Solo conectar si el usuario YA está autenticado (cuando recarga la página)
    if (this.authService.isAuthenticated()) {
      const idCanton = this.authService.getIdCanton();
      this.socketService.conectar(idCanton);

      this.socketService.escucharNuevosCasos().subscribe({
        next: (notificacion) => {
          console.log('🔔 Notificación recibida:', notificacion);
        }
      });
    }
  }

  ngOnDestroy(): void {
    console.log("destruyendo appcomponent")
    this.socketService.desconectar();
  }
}
