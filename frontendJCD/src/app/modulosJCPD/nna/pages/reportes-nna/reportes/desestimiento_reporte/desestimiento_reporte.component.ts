import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { CommonModule } from '@angular/common';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

interface DesestimientoData {
  totalDesestimientos: number;
}

@Component({
  selector: 'app-desestimiento_reporte',
  templateUrl: './desestimiento_reporte.component.html',
  imports: [ReactiveFormsModule, FiltroComponent, CommonModule],
})
export class Desestimiento_reporteComponent implements OnInit {
  filtroForm!: FormGroup;
  desestimientoData: DesestimientoData | null = null;
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

    this.reporteService.getReporteDesestimiento(grupo, desde, hasta)
      .subscribe({
        next: (response: DesestimientoData) => {
          this.desestimientoData = response;
          this.loading = false;
          console.log('Datos de desestimientos:', response);
        },
        error: (error: any) => {
          console.error('Error cargando desestimientos:', error);
          this.error = 'Error al cargar los datos';
          this.loading = false;
        }
      });
  }
}

export default Desestimiento_reporteComponent;
