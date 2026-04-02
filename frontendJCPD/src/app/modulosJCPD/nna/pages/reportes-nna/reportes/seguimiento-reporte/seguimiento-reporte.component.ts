import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { CommonModule } from '@angular/common';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

interface MedidasCumplimientoData {
  medidasCumplidas: number;
  medidasNoCumplidas: number;
}

@Component({
  selector: 'app-seguimiento-reporte',
  templateUrl: './seguimiento-reporte.component.html',
  imports: [ReactiveFormsModule, FiltroComponent, CommonModule],
})
export class SeguimientoReporteComponent implements OnInit {
  filtroForm!: FormGroup;
  medidasData: MedidasCumplimientoData | null = null;
  loading = false;
  error: string | null = null;

  // Total de seguimientos (calculado)
  get totalSeguimientos(): number {
    if (!this.medidasData) return 0;
    return this.medidasData.medidasCumplidas + this.medidasData.medidasNoCumplidas;
  }

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

    this.reporteService.getReporteMedidasDefinitivasCumplidas(grupo, desde, hasta)
      .subscribe({
        next: (response: MedidasCumplimientoData) => {
          this.medidasData = response;
          this.loading = false;
          console.log('Medidas cumplidas:', response);
        },
        error: (error: any) => {
          console.error('Error cargando medidas:', error);
          this.error = 'Error al cargar los datos';
          this.loading = false;
        }
      });
  }
}

export default SeguimientoReporteComponent;
