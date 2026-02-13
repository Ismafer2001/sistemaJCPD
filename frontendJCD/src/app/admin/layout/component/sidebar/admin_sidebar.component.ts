import { Component,  ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterLink } from '@angular/router';

import { ModalComponent, ModalConfig } from '@shared/components/modal/modal.component';

@Component({
  selector: 'admin-layout-sidebar',
  templateUrl: './admin_sidebar.component.html',
  imports: [RouterLink, CommonModule, ModalComponent],

})
export class SidebarComponentAdmin {
  @ViewChild(ModalComponent) modalComponent!: ModalComponent;

  // Modal de confirmación de cierre de sesión
  mostrarModalLogout = false;
  modalConfig: ModalConfig = {
    titulo: 'Cerrar Sesión',
    descripcion: '¿Está seguro de que desea cerrar su sesión? Perderá cualquier trabajo no guardado.',
    mostrarInput: false
  };

constructor(private router: Router){

    }

    iniciarLogout(): void {
      this.mostrarModalLogout = true;
    }

    confirmarLogout(): void {
      localStorage.removeItem('token');

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
export default SidebarComponentAdmin;
