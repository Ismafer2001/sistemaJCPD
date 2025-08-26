import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'nna-layout-sidebar',
  imports:[RouterLink ],
  templateUrl: './nna_layout_sidebar.component.html',

})
export class SidebarComponent   {

  constructor(private authService: AuthService,private router: Router){

  }

  logout(): void {
    localStorage.removeItem('token');


    this.router.navigate(['/login']);
  }


}
export default SidebarComponent;
