import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModalComponent, ModalConfig } from '@shared/components/modal/modal.component';
import { WebSocketService } from '@shared/services/web-socket.service';



@Component({
  selector: 'nna-layout-sidebar',
  imports:[RouterLink, CommonModule, ModalComponent ],
  templateUrl: './nna_layout_sidebar.component.html',

})
export class SidebarComponent  implements OnInit {
  @ViewChild(ModalComponent) modalComponent!: ModalComponent;

  grupo: string = '';

  // Modal de confirmación de cierre de sesión
  mostrarModalLogout = false;
  modalConfig: ModalConfig = {
    titulo: ' Cerrar Sesión',
    descripcion: '¿Está seguro de que desea cerrar su sesión? ',
    mostrarInput: false
  };

  // Configuración de grupos válidos
  private gruposValidos = ['nna', 'adultos', 'mujeres'];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private webSocketService: WebSocketService
  ){

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const grupo = params['grupo'];
      if (this.gruposValidos.includes(grupo)) {
        this.grupo = grupo;
      } else {
        console.error('Grupo no válido:', grupo);
        this.grupo = '';
      }
    });
  }


  iniciarLogout(): void {
    this.mostrarModalLogout = true;
  }

  confirmarLogout(): void {
    localStorage.removeItem('token');
    this.webSocketService.desconectar();
    this.router.navigate(['/login']);
    this.cerrarModalLogout();
  }

  cerrarModalLogout(): void {
    this.mostrarModalLogout = false;
  }

  // Método original mantenido por compatibilidad
  logout(): void {
    this.iniciarLogout();
  }


}
export default SidebarComponent;
