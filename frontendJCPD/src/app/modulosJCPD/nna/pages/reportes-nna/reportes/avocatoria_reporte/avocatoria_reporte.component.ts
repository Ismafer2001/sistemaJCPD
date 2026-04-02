import { Component, OnInit } from '@angular/core';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { KeyValuePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-avocatoria_reporte',
  templateUrl: './avocatoria_reporte.component.html',
  imports: [KeyValuePipe, FiltroComponent, CommonModule]
})
export class Avocatoria_reporteComponent implements OnInit {
  filtroForm!:FormGroup
  reporte: any;
  medidasConnanart217: any;
  medidasCONNAart59: any;
  vulneraciones: any;
  medidasPorArticulo: any[] = [];
  articulosColapsados: { [key: string]: boolean } = {};

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

    this.reporteService.getReporteVocatoria(grupo, desde, hasta)
      .subscribe(data =>{
        this.reporte = data



      });
      this.reporteService.getReporteAvocatoriaMedidas(grupo, desde, hasta)
      .subscribe(data =>{
        this.medidasConnanart217 = data.CONNA_art_217
        this.medidasCONNAart59 = data.CONNA_art_59
        this.procesarMedidas(data);

        console.log('aquiiiii',data)
      });
      this.reporteService.getReporteAvocatoriavulneraciones(grupo, desde, hasta)
      .subscribe(data =>{
        this.vulneraciones = data


        console.log(data)
      });

  }

  // Procesar las medidas para mostrarlas organizadas por artículo
  procesarMedidas(data: any): void {
    this.medidasPorArticulo = [];

    if (data) {
      // Iterar dinámicamente sobre todos los artículos que vengan del servidor
      Object.keys(data).forEach(articulo => {
        const medidasDelArticulo = data[articulo];
        const medidasDelArticuloArray: any[] = [];

        // Iterar sobre cada medida dentro del artículo
        Object.keys(medidasDelArticulo).forEach(medida => {
          const cantidad = medidasDelArticulo[medida];
          medidasDelArticuloArray.push({
            medida: medida.replace(/_/g, ' '),
            cantidad: cantidad
          });
        });

        // Agrupar por artículo
        this.medidasPorArticulo.push({
          articulo: articulo.replace(/_/g, ' '),
          medidas: medidasDelArticuloArray,
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
}
export default Avocatoria_reporteComponent;
