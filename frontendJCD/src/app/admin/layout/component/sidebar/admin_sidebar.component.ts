import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'admin-layout-sidebar',
  templateUrl: './admin_sidebar.component.html',

})
export class SidebarComponentAdmin {

constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/auth/login']);
  }

}
export default SidebarComponentAdmin;
