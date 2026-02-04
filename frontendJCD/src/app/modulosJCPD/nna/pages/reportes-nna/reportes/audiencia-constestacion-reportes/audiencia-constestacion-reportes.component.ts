import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

@Component({
  selector: 'app-audiencia-constestacion-reportes',
  templateUrl: './audiencia-constestacion-reportes.component.html',
  imports: [ReactiveFormsModule, FiltroComponent],
})
export class AudienciaConstestacionReportesComponent implements OnInit {
  audiencias: any;
  filtroForm!: FormGroup

  constructor(private fb: FormBuilder, private reporteService: ReporteService) { }

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

      this.reporteService.getReporteAudienciaContestacion(grupo, desde, hasta)
        .subscribe(data =>{
          this.audiencias = data
          console.log(data)
        });
  }
}
export default AudienciaConstestacionReportesComponent;
