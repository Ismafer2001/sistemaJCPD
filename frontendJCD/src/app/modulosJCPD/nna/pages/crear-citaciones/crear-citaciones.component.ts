import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { CitacionesService } from '@nna/services/citaciones.service';

interface involucrados{
  nombres:string,
  parte:string

}
interface notificacion{
  codigoTramite: string;
  Canton:string;
}

@Component({
  selector: 'app-crear-citaciones',
  templateUrl: './crear-citaciones.component.html',
  imports:[TablaComponent,CardFormComponent,CommonModule,ReactiveFormsModule]

})
export class CrearCitacionesComponent implements OnInit {


  currentTab='0'
    involucrados:involucrados[]=[]
    citar:notificacion={codigoTramite:'',Canton:''};
    denunciaId =0

    citacionForm!:FormGroup;
    fechaHoraActual: Date = new Date();


  constructor(private CitacionesService:CitacionesService,
       private route:ActivatedRoute,
       private router:Router,

      private fb:FormBuilder) { }

  ngOnInit() {
    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];

    });

    this.loadinvolucrados(this.denunciaId)
    this.loadCitados(this.denunciaId)
    this.formularioFormatoCitacion();
    this.citacionForm.valueChanges.subscribe(value => {
      console.log('Formulario actualizado:', value);
    })

  }


   //----------------------FORMULARIOS-------------------------//

  formularioFormatoCitacion(){
    this.citacionForm = this.fb.group({
      idDenuncia:[this.denunciaId],
      codigoTramite:[],
      diriguidoA:['', Validators.required],
      fecha:['', Validators.required],
      hora:['', Validators.required],
      direccion:['', Validators.required],
      local:['', Validators.required],

      parte:['', Validators.required],
      fechaCreacion:[this.fechaHoraActual.toISOString().split('T')[0]],
      numOficio:[],




    })
  }

  //--------------------CARGA DE DATOS------------//

  loadinvolucrados(id:number){

  this.CitacionesService.getinvolucradosCitaciones(id).subscribe(data=>{
    this.involucrados=data;
    console.log(data)
  })

  }
  loadCitados(id:number){
    this.CitacionesService.getcitacioenesDTO(id).subscribe(data=>{
      this.citar=data;
      this.citacionForm.patchValue({
          codigoTramite: this.citar.codigoTramite,

        });
    })
  }


  //-----------*-----------OTROS--------------//


  cambiarTab(valor: string) {
  this.currentTab = valor;

  const itemSeleccionado = this.involucrados.find(i => i.nombres === valor);

  if (itemSeleccionado) {
    this.citacionForm.patchValue({
      diriguidoA: itemSeleccionado.nombres,
      parte: itemSeleccionado.parte
    });
  }
}
//---------------------sudmit---------------------//
submitCitacion() {
  const body ={
    ...this.citacionForm.value,

  }
  this.CitacionesService.postCitar(body).subscribe({
    next: () => {

            this.router.navigate(['/nna']);
          }

  })

}



}
export default CrearCitacionesComponent
