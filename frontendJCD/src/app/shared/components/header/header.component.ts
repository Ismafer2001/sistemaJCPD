

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'globla-header',
  imports: [CommonModule,RouterLink],
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

  // Configuración de módulos
  private modulosConfig = {
    'nna': 'Niñez y Adolescencia',
    'adultos': 'Adultos Mayores',
    'mujeres': 'Mujeres Victima de Violencia'
  };

  constructor(private AuthService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const grupo = params['grupo'];
      this.nombreModulo = this.modulosConfig[grupo as keyof typeof this.modulosConfig] || 'Junta Cantonal de Protección de Derechos';

      console.log('Grupo actual:', grupo);
    });

    this.AuthService.getUsuarioActual().subscribe(user => {
      this.nombreUsuario = user.nombres;
      this.rolUsuario = user.rol;
      this.cantonUsuario = user.canton;
      console.log(user);
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

