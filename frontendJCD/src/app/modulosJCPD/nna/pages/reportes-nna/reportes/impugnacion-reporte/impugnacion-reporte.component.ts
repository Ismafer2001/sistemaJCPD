import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { CommonModule } from '@angular/common';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

interface ImpugnacionData {
  reposiciones: number;
  apelaciones: number;
}

@Component({
  selector: 'app-impugnacion-reporte',
  templateUrl: './impugnacion-reporte.component.html',
  imports: [ReactiveFormsModule, FiltroComponent, CommonModule],
})
export class ImpugnacionReporteComponent implements OnInit {
  filtroForm!: FormGroup;
  impugnacionData: ImpugnacionData | null = null;
  loading = false;
  error: string | null = null;
  
  // Total de impugnaciones (calculado)
  get totalImpugnaciones(): number {
    if (!this.impugnacionData) return 0;
    return this.impugnacionData.reposiciones + this.impugnacionData.apelaciones;
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

    this.reporteService.getReporteInpugnacion(grupo, desde, hasta)
      .subscribe({
        next: (response: ImpugnacionData) => {
          this.impugnacionData = response;
          this.loading = false;
          console.log('Datos de impugnaciones:', response);
        },
        error: (error: any) => {
          console.error('Error cargando impugnaciones:', error);
          this.error = 'Error al cargar los datos';
          this.loading = false;
        }
      });
  }
}

export default ImpugnacionReporteComponent;
