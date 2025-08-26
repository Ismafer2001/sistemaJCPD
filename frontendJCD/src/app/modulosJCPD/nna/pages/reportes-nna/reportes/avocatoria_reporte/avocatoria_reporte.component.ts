import { Component, OnInit } from '@angular/core';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-avocatoria_reporte',
  templateUrl: './avocatoria_reporte.component.html',
  imports: [KeyValuePipe,FiltroComponent]

})
export class Avocatoria_reporteComponent implements OnInit {
  filtroForm!:FormGroup
  reporte: any;
  medidasConnanart217: any;
  medidasCONNAart59: any;
  vulneraciones: any;

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


        console.log(data)
      });
      this.reporteService.getReporteAvocatoriaMedidas(grupo, desde, hasta)
      .subscribe(data =>{
        this.medidasConnanart217 = data.CONNA_art_217
        this.medidasCONNAart59 = data.CONNA_art_59


        console.log(data)
      });
      this.reporteService.getReporteAvocatoriavulneraciones(grupo, desde, hasta)
      .subscribe(data =>{
        this.vulneraciones = data


        console.log(data)
      });

  }
}
export default Avocatoria_reporteComponent;
