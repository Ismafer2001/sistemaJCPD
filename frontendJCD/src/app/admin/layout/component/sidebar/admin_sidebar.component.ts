import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AdminLayoutHeaderComponent } from "../header/admin_layout_header.component";
import { AdminLayoutContentComponent } from "../content/admin_layout_content.component";
import { ModalComponent, ModalConfig } from '@shared/components/modal/modal.component';
import { toast } from 'ngx-sonner';
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

constructor(private authService: AuthService,private router: Router){

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
