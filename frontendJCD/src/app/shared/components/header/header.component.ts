

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'globla-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',


})
export class headerComponent implements OnInit {
  @Input() moduloActual: string = '';
  nombreUsuario: string = '';
  rolUsuario: string = '';
  cantonUsuario: string = '';
  private destroy$ = new Subject<void>();
  mostrarMenuUsuario = false;
  nombreModulo: string = "";
  constructor(private AuthService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
    if (params['grupo']=='nna') {
      this.nombreModulo = "Niñez y Adolescencia"

    } else if (params['grupo']=='adultos') {
      this.nombreModulo = "Adultos Mayores"

    };
  })
    this.AuthService.getUsuarioActual().subscribe(user => {
  this.nombreUsuario = user.nombres;
  this.rolUsuario = user.rol;
  this.cantonUsuario = user.canton
  console.log(user)


});
  }

   toggleMenu() {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
  }

  cerrarMenu() {
    this.mostrarMenuUsuario = false;
  }

}
export default headerComponent;

