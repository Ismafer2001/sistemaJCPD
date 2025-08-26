import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

@Component({
  selector: 'app-notificaciones-reporte',
  templateUrl: './notificaciones-reporte.component.html',
  imports: [ReactiveFormsModule, FiltroComponent]

})
export class NotificacionesReporteComponent implements OnInit {
  notificaciones: any;
  filtroForm: any;

  constructor(private reporteService: ReporteService, private fb: FormBuilder) { }

  ngOnInit() {

    this.formfilter();
    this.filtrar();
  }
  //---------------armar formulario-----------//
formfilter(){
  this.filtroForm = this.fb.group({
      desde: [],
      hasta: []
    });
}

//----------submit-------------///
filtrar(): void {
    const { desde, hasta } = this.filtroForm.value;
    const grupo = 'nna';

    this.reporteService.getReporteNotificaciones(grupo, desde, hasta)
      .subscribe(data =>{
        this.notificaciones= data

        console.log(data)
      });

  }


}
export default NotificacionesReporteComponent;
