import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { CommonModule } from '@angular/common';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-resoluciones-reporte',
  templateUrl: './resoluciones-reporte.component.html',
  imports: [ReactiveFormsModule, FiltroComponent, CommonModule],
})
export class ResolucionesReporteComponent implements OnInit {
  resoluciones: any;
  medidasDefinitivas: any;
  filtroForm!: FormGroup;
  medidasArray: any[] = [];
  medidasPorArticulo: any[] = [];
  articulosColapsados: { [key: string]: boolean } = {};
  totalAfectados: number = 0;

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

      // Llamar a ambos servicios en paralelo
      forkJoin({
        resoluciones: this.reporteService.getReporteresoluciones(grupo, desde, hasta),
        medidas: this.reporteService.getReporteMedidasDefinitivas(grupo, desde, hasta)
      }).subscribe(data => {
        this.resoluciones = data.resoluciones;
        this.medidasDefinitivas = data.medidas;
        this.procesarMedidas();
        console.log('Resoluciones:', data.resoluciones);
        console.log('Medidas:', data.medidas);
      });
  }

  // Procesar las medidas para mostrarlas dinámicamente
  procesarMedidas(): void {
    this.medidasArray = [];
    this.medidasPorArticulo = [];

    if (this.medidasDefinitivas && this.medidasDefinitivas.medidas) {
      // Guardar el total que viene del servidor
      this.totalAfectados = this.medidasDefinitivas.totalAfectadosConMedidasDefinitivas || 0;

      const medidasData = this.medidasDefinitivas.medidas;

      // Iterar sobre cada artículo
      Object.keys(medidasData).forEach(articulo => {
        const medidasDelArticulo = medidasData[articulo];
        const medidasDelArticuloArray: any[] = [];
        let totalNinosArticulo = 0;

        // Iterar sobre cada medida dentro del artículo
        Object.keys(medidasDelArticulo).forEach(medida => {
          const cantidad = medidasDelArticulo[medida];
          const medidaObj = {
            articulo: articulo.replace(/_/g, ' '),
            medida: medida.replace(/_/g, ' '),
            cantidad: cantidad
          };

          this.medidasArray.push(medidaObj);
          medidasDelArticuloArray.push(medidaObj);
          totalNinosArticulo += cantidad;
        });

        // Agrupar por artículo
        this.medidasPorArticulo.push({
          articulo: articulo.replace(/_/g, ' '),
          medidas: medidasDelArticuloArray,
          totalNinos: totalNinosArticulo,
          totalMedidas: medidasDelArticuloArray.length
        });

        // Inicializar estado colapsado (abierto por defecto)
        this.articulosColapsados[articulo] = false;
      });
    }
  }

  // Toggle para colapsar/expandir artículos
  toggleArticulo(articulo: string): void {
    this.articulosColapsados[articulo] = !this.articulosColapsados[articulo];
  }

  // Calcular total de niños beneficiados (ahora viene del servidor)
  getTotalNinosBeneficiados(): number {
    return this.totalAfectados;
  }

  // Obtener total de medidas diferentes
  getTotalMedidasDiferentes(): number {
    return this.medidasArray.length;
  }
}
export default ResolucionesReporteComponent;
