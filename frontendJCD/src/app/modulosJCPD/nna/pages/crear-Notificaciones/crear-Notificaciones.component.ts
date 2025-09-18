import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router,} from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { NotificacionService } from '@nna/services/notificacion.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import  TablaNavigatorComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { ButtonSubmitComponent } from "../../../../shared/components/button-submit/button-submit.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';


interface involucrados{
  nombres: string;
  parte: string;
  idUsuario?: number;
}
interface notificacion{
  codigoTramite: string;
  Canton:string;
  fechaCreado?: Date;

}
@Component({
  selector: 'app-crear-Notificaciones',
  templateUrl: './crear-Notificaciones.component.html',
  imports: [CardFormComponent, TablaNavigatorComponent, CommonModule, ReactiveFormsModule, FormsModule, ButtonSubmitComponent]
})


export class CrearNotificacionesComponent implements OnInit {
  currentTab = '0';
  involucrados: involucrados[] = [];
  notificar: notificacion = { codigoTramite: '', Canton: '', fechaCreado: new Date() };
  denunciaId = 0;
  nuevoNotificadoForm!: FormGroup;
  notificacionForm!: FormGroup;
  fechaHoraActual: Date = new Date();
  tipoNotificado: 'persona' | 'institucion' | '' = '';
    pdfSrc: SafeResourceUrl | null = null;
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;
  idNotificacion!: number;




  constructor(private notificacionServices:NotificacionService,
     private route:ActivatedRoute,
     private router:Router,
    private fb:FormBuilder,
    private sanitizer: DomSanitizer ) {}

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
      if (!this.guardarDisabled) return; // Solo si ya se guardó
      this.pdfDisabled = true;
      this.editarDisabled = false;
    });

  }

  //----------------------FORMULARIOS-------------------------//

  formularioNotificados(){
    this.nuevoNotificadoForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      parte: ['', Validators.required],

      idDenuncia: [this.denunciaId]
    });
  }

  formularioFormatoNotificacion(){
    this.notificacionForm = this.fb.group({
      codigoTramite:['',Validators.required],
      idDenuncia:[this.denunciaId],
      diriguidoA:['', Validators.required],
      idUsuario: [''],
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
    console.log(this.involucrados);

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
      // Setear idUsuario en el formulario de notificado si existe
      if (itemSeleccionado.idUsuario) {
        this.notificacionForm.get('idUsuario')?.setValue(itemSeleccionado.idUsuario);
      }
    }
  }
//------------submit-----//

volver(): void {
    this.router.navigate(['/nna/fases/' + this.denunciaId]);
  }

  //--editar
  updateNotificacion() {
  const body ={
    ...this.notificacionForm.value,


  }
  this.notificacionServices.actualizarNotificacion(this.idNotificacion, body).subscribe({
      next: () => {
        toast.success('Notificación Actualizada con Éxito', {
                  duration: 3000,
                });
          this.pdfDisabled = false;
          this.editarDisabled = true;

      },
      error: (err) => {
        toast.error('Error al actualizar la notificación', {
          duration: 3000,
        });
      }

    })
}



submitNotificacion() {
  if (this.notificacionForm.invalid) {
    this.notificacionForm.markAllAsTouched();
    toast.error('Formulario inválido', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
  const body ={
    ...this.notificacionForm.value,

  }
  this.notificacionServices.postNotificar(body).subscribe({
   next: (body) => {
      this.idNotificacion = body.id;
      toast.success('Notificación Guardada con Éxito', {
                duration: 3000,
              });
      this.pdfDisabled = false;
        this.guardarDisabled = true;

    },
    error(err) {

      toast.error('Error al guardar', {
        duration: 3000,
      description:`${err}`
      });

  }

  })

}
generarPdf(){

    this.notificacionServices.crearpdfBlob(this.idNotificacion).subscribe((res: Blob) => {
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab('2');
  }

  onSubmit(): void {
    // Si es institución, forzar parte a 'institucion'
    if (this.tipoNotificado === 'institucion') {
      this.nuevoNotificadoForm.get('parte')?.setValue('institucion');
    }

    const body = {
      ...this.nuevoNotificadoForm.value,

    };
    console.log(body);
    this.notificacionServices.postCrearnotificado(body).subscribe(() => {
      this.loadinvolucrados(this.denunciaId);
      this.nuevoNotificadoForm.reset();
      this.nuevoNotificadoForm.get('idDenuncia')?.setValue(this.denunciaId);

    });
  }

}
export default CrearNotificacionesComponent
