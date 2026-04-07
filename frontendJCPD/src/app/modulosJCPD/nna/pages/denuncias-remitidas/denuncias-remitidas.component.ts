import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FasesCardComponent } from '../fases/componentes/fases-card/fases-card.component';
import { CardFormComponent } from "@shared/components/card-Form/card-Form.component";
import TablaNavigatorComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { InhibirseService } from '@nna/services/inhibirse.service';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-denuncias-remitidas',
  templateUrl: './denuncias-remitidas.component.html',
  imports: [CommonModule, RouterLink,  CardFormComponent, TablaNavigatorComponent]
})
export class DenunciasRemitidasComponent implements OnInit {
  // Propiedades para la tabla
  deprecatorias: any[] = [];
  loading = true;
  error = '';

  // Configuración de la tabla
  columnasTabla = ['codigoTramite', 'estadoRecepcion', 'cantonOrigen.nombre', 'afectadosNombres'];
  encabezadosTabla = ['Código Trámite', 'Estado', 'Cantón Origen', 'Afectados'];
   grupo:string ='nna'
   
  constructor(
    private route: ActivatedRoute,
    private inhibirseService: InhibirseService,
    private authService: AuthService
  ) { }


  ngOnInit() {


    // Cargar deprecatorias
    this.cargarDeprecatorias();
  }

  cargarDeprecatorias() {
    // Obtener el canton del usuario desde el token
    const usuarioInfo = this.authService.getUsuarioInfo();
    const idCanton = usuarioInfo?.id_canton;

    if (idCanton) {
      this.inhibirseService.getDeprecatorias(idCanton).subscribe({
        next: (data) => {
          this.deprecatorias = this.procesarDatosTabla(data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar deprecatorias:', error);
          this.error = 'Error al cargar las deprecatorias';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No se pudo obtener el cantón del usuario';
      this.loading = false;
    }
  }

  procesarDatosTabla(data: any[]): any[] {
    return data.map(item => ({
      ...item,
      afectadosNombres: item.afectados?.map((afectado: any) =>
        `${afectado.nombres} ${afectado.apellidos}`
      ).join(', ') || 'Sin afectados'
    }));
  }

}

export default DenunciasRemitidasComponent;
