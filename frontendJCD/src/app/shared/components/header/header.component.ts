

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';

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

  mostrarMenuUsuario = false;
  constructor(private AuthService: AuthService) {}

  ngOnInit(): void {
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

