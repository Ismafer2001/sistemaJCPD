import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

@Component({
  selector: 'app-citaciones_reporte',
  templateUrl: './citaciones_reporte.component.html',
  imports: [ReactiveFormsModule, FiltroComponent],

})
export class Citaciones_reporteComponent implements OnInit {
   citaciones: any;
    filtroForm!:FormGroup

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

    this.reporteService.getReporteCitaciones(grupo, desde, hasta)
      .subscribe(data =>{
        this.citaciones = data


        console.log(data)
      });

  }


}export default Citaciones_reporteComponent;
