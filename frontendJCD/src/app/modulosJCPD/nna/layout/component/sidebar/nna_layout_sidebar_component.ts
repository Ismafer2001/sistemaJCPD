import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


@Component({
  selector: 'nna-layout-sidebar',
  imports:[RouterLink ],
  templateUrl: './nna_layout_sidebar.component.html',

})
export class SidebarComponent  implements OnInit {

  grupo: string = '';

  constructor(private authService: AuthService,private router: Router,
    private route: ActivatedRoute
  ){

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {

    if (params['grupo']=='nna') {
      this.grupo = "nna"

    } else {
      this.grupo = "adultos"

    };
  })
  }


  logout(): void {
    localStorage.removeItem('token');


    this.router.navigate(['/login']);
  }


}
export default SidebarComponent;
