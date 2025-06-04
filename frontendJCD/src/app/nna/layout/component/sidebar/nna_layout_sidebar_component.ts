import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'nna-layout-sidebar',
  templateUrl: './nna_layout_sidebar.component.html',

})
export class SidebarComponent   {

 constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/auth/login']);
  }
}
export default SidebarComponent;
