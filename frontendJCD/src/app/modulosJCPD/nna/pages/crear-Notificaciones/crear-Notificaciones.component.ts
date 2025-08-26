import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router,} from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { NotificacionService } from '@nna/services/notificacion.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import  TablaNavigatorComponent from '@shared/components/tabla/tablaNavigator/tabla.component';


interface involucrados{
  nombres:string,
  parte:string

}
interface notificacion{
  codigoTramite: string;
  Canton:string;
  fechaCreado?: Date;

}
@Component({
  selector: 'app-crear-Notificaciones',
  templateUrl: './crear-Notificaciones.component.html',
  imports:[CardFormComponent,TablaNavigatorComponent,CommonModule,ReactiveFormsModule]

})


export class CrearNotificacionesComponent implements OnInit {
  currentTab='0'
  involucrados:involucrados[]=[]
  notificar:notificacion={codigoTramite:'',Canton:'', fechaCreado: new Date()};
  denunciaId =0
  nuevoNotificadoForm!:FormGroup;
  notificacionForm!:FormGroup;
  fechaHoraActual: Date = new Date();




  constructor(private notificacionServices:NotificacionService,
     private route:ActivatedRoute,
     private router:Router,



    private fb:FormBuilder) {




     }

  ngOnInit() {

    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];

    });

    this.loadinvolucrados(this.denunciaId)
    this.loadNotificados(this.denunciaId)

    this.formularioNotificados()
    this.formularioFormatoNotificacion();
     this.nuevoNotificadoForm.get('idDenuncia')?.setValue(this.denunciaId);

    this.notificacionForm.get('idDenuncia')?.setValue(this.denunciaId);

    this.notificacionForm.valueChanges.subscribe(n=>{

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
      codigoTramite:['',Validators.required],
      idDenuncia:[this.denunciaId],
      diriguidoA:['', Validators.required],
      parte:[],
      direccion:[],
      fecha:[this.fechaHoraActual.toISOString().split('T')[0]],
      numOficio:[],




    })
  }

  //--------------------CARGA DE DATOS------------//

  loadinvolucrados(id:number){

  this.notificacionServices.getinvolucrados(id).subscribe(data=>{
    this.involucrados=data;

  })

  }
  loadNotificados(id:number){
    this.notificacionServices.getnotificacionDTO(id).subscribe(data=>{
      this.notificar=data;
       this.notificacionForm.patchValue({
          codigoTramite: this.notificar.codigoTramite,

        });


    })
  }


  //-----------*-----------OTROS--------------//


  cambiarTab(valor: string) {
  this.currentTab = valor;

  const itemSeleccionado = this.involucrados.find(i => i.nombres === valor);

  if (itemSeleccionado) {
    this.notificacionForm.patchValue({
      diriguidoA: itemSeleccionado.nombres,
      parte: itemSeleccionado.parte
    });
  }
}
//------------submit-----//
submitNotificacion() {
  const body ={
    ...this.notificacionForm.value,

  }
  this.notificacionServices.postNotificar(body).subscribe({
    next: (res) => {


  window.open(res.datosGenerales, '_blank');

            this.router.navigate(['/nna']);
          }

  })

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
