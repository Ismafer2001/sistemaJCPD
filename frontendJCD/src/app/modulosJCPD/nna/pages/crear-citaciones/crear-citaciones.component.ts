import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaComponent from '@shared/components/tabla/tabla.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
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

    notificacionForm!:FormGroup;
    fechaHoraActual: Date = new Date();

  constructor(private CitacionesService:CitacionesService,
       private route:ActivatedRoute,

      private fb:FormBuilder) { }

  ngOnInit() {
    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];

    });

    this.loadinvolucrados(this.denunciaId)
    this.loadCitados(this.denunciaId)

  }
   //----------------------FORMULARIOS-------------------------//



  formularioFormatoCitacion(){
    this.notificacionForm = this.fb.group({
      codigoTramtite:[],
      diriguidoA:[],
      parte:[],
      fechaCreacion:[],
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
      console.log(data)

      console.log(typeof data)
    })
  }


  //-----------*-----------OTROS--------------//
  seleccionarInvolucrado(){

  }

  cambiarTab(tab: string) {
    this.currentTab = tab;
  }


}
export default CrearCitacionesComponent
