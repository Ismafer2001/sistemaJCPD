import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { CommonModule } from '@angular/common';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

interface CierreCasoData {
  totalCierreCasos: number;
}

@Component({
  selector: 'app-cierre-reporte',
  templateUrl: './cierre-reporte.component.html',
  imports: [ReactiveFormsModule, FiltroComponent, CommonModule],
})
export class CierreReporteComponent implements OnInit {
  filtroForm!: FormGroup;
  cierreCasoData: CierreCasoData | null = null;
  loading = false;
  error: string | null = null;

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
    this.loading = true;
    this.error = null;

    const { desde, hasta } = this.filtroForm.value;
    const grupo = 'nna';

    this.reporteService.getReporteCierreCaso(grupo, desde, hasta)
      .subscribe({
        next: (response: CierreCasoData) => {
          this.cierreCasoData = response;
          this.loading = false;
          console.log('Datos de cierre de casos:', response);
        },
        error: (error: any) => {
          console.error('Error cargando cierre de casos:', error);
          this.error = 'Error al cargar los datos';
          this.loading = false;
        }
      });
  }
}

export default CierreReporteComponent;
