import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,ReactiveFormsModule } from '@angular/forms';
import { ReporteService } from '@nna/services/reporte.service';
import { KeyValuePipe } from '@angular/common';
import FiltroComponent from '../../reportesnna-component/filtro/filtro.component';

@Component({
  selector: 'app-denuncia_reporte',
  templateUrl: './denuncia_reporte.component.html',
  imports: [ReactiveFormsModule, KeyValuePipe, FiltroComponent],

})
export class Denuncia_reporteComponent implements OnInit {
    resumen: any;
    filtroForm!:FormGroup
    afectadoEdad: any;
    afectadoNacionalidad: any;
    compareNone = () => 0;

  constructor(private fb: FormBuilder, private reporteService:ReporteService) { }

  ngOnInit() {

      this.formfilter();
      this.filtrar();
      this.filtroForm.valueChanges.subscribe((n) => {
        console.log(n)

      });

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

    this.reporteService.obtenerResumen(grupo, desde, hasta)
      .subscribe(data =>{
        this.resumen = data
        this.afectadoEdad = data.AfectadosPorEdad;
        this.afectadoNacionalidad = data.afectadosPorNacionalidad;

        console.log(data)
      });

  }
mapNacionalidad(key: unknown): string {
  const k = String(key ?? '');
  const diccionario: Record<string, string> = {
    col: 'Colombia',
    ec: 'Ecuador',
    ven: 'Venezuela',
  };
  return diccionario[k] ?? k;
}

}
export default Denuncia_reporteComponent;
