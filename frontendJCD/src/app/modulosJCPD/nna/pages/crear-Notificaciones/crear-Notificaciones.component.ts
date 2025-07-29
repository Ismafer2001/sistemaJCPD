import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router} from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { NotificacionService } from '@nna/services/notificacion.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaComponent from '@shared/components/tabla/tabla.component';


interface involucrados{
  nombres:string,
  parte:string

}
interface notificacion{
  codigoTramite: string;
  Canton:string;
}
@Component({
  selector: 'app-crear-Notificaciones',
  templateUrl: './crear-Notificaciones.component.html',
  imports:[CardFormComponent,TablaComponent,CommonModule,ReactiveFormsModule]

})


export class CrearNotificacionesComponent implements OnInit {
  currentTab='0'
  involucrados:involucrados[]=[]
  notificar:notificacion={codigoTramite:'',Canton:''};
  denunciaId =0
  nuevoNotificadoForm!:FormGroup;
  notificacionForm!:FormGroup;
  fechaHoraActual: Date = new Date();



  constructor(private notificacionServices:NotificacionService,
     private route:ActivatedRoute,
     private AuthService:AuthService,

    private fb:FormBuilder) {
      



     }

  ngOnInit() {

    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];

    });

    this.loadinvolucrados(this.denunciaId)
    this.loadNotificados(this.denunciaId)

    this.formularioNotificados()

    this.nuevoNotificadoForm.get('idDenuncia')?.setValue(this.denunciaId);

    this.nuevoNotificadoForm.valueChanges.subscribe(n=>{

      console.log(n)

    });

  }

  //----------------------FORMULARIOS-------------------------//

  formularioNotificados(){
    this.nuevoNotificadoForm =this.fb.group({
        nombres:['',Validators.required],
        parte:['',Validators.required],
        idDenuncia:[this.denunciaId]
      })

  }

  formularioFormatoNotificacion(){
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

  this.notificacionServices.getinvolucrados(id).subscribe(data=>{
    this.involucrados=data;
    console.log(data)
  })

  }
  loadNotificados(id:number){
    this.notificacionServices.getnotificacionDTO(id).subscribe(data=>{
      this.notificar=data;
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

  onSubmit():void{
    const body={
      ...this.nuevoNotificadoForm.value
    }
    console.log(body)
    this.notificacionServices.postCrearnotificado(body).subscribe(()=>{
       this.loadinvolucrados(this.denunciaId);
       this.nuevoNotificadoForm.reset();

    })

  }

}
export default CrearNotificacionesComponent
