import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AdminLayoutHeaderComponent } from "../header/admin_layout_header.component";
import { AdminLayoutContentComponent } from "../content/admin_layout_content.component";
@Component({
  selector: 'admin-layout-sidebar',
  templateUrl: './admin_sidebar.component.html',
  imports: [RouterLink],

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
