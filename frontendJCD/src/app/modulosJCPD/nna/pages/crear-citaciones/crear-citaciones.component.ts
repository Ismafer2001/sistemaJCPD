import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import  TablaNavigatorComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { CitacionesService } from '@nna/services/citaciones.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

interface involucrados{
  personasNotificadas:string,
  parte:string
  idUsuario?: number;

}
interface notificacion{
  codigoTramite: string;
  Canton:string;
}

@Component({
  selector: 'app-crear-citaciones',
  templateUrl: './crear-citaciones.component.html',
  imports:[TablaNavigatorComponent,CardFormComponent,CommonModule,ReactiveFormsModule, ButtonSubmitComponent]

})
export class CrearCitacionesComponent implements OnInit {


  currentTab='0'
    involucrados:involucrados[]=[]
    citar:notificacion={codigoTramite:'',Canton:''};
    denunciaId =0
    citacionForm!:FormGroup;
    fechaHoraActual: Date = new Date();
      pdfSrc: SafeResourceUrl | null = null;
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;
  idCitacion!: number;


  constructor(private CitacionesService:CitacionesService,
       private route:ActivatedRoute,
       private router:Router,
       private fb:FormBuilder,
       private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];

    });

    this.loadinvolucrados(this.denunciaId)
    this.loadCitados(this.denunciaId)
    this.formularioFormatoCitacion();
    this.citacionForm.valueChanges.subscribe(value => {
      console.log('Formulario actualizado:', value);
      if (!this.guardarDisabled) return; // Solo si ya se guardó
      this.pdfDisabled = true;
      this.editarDisabled = false;

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
      idUsuario: [''],
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

  const itemSeleccionado = this.involucrados.find(i => i.personasNotificadas === valor);

    if (itemSeleccionado) {
      this.citacionForm.patchValue({
        diriguidoA: itemSeleccionado.personasNotificadas,
        parte: itemSeleccionado.parte
      });
      // Setear idUsuario en el formulario de notificado si existe
      if (itemSeleccionado.idUsuario) {
        this.citacionForm.get('idUsuario')?.setValue(itemSeleccionado.idUsuario);
      }
    }
}
//---------------------submit---------------------//
volver(): void {
    this.router.navigate(['/nna/fases/' + this.denunciaId]);
  }
updateCitacion() {
  const body ={
    ...this.citacionForm.value,


  }
  this.CitacionesService.actualizarCitacion(this.idCitacion, body).subscribe({
      next: () => {
        toast.success('Citacion Actualizada con Éxito', {
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
submitCitacion() {
   if (this.citacionForm.invalid) {
      this.citacionForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        duration: 3000,
        description: 'Por Favor, Completa Todos los Campos Requeridos'
      });
      return;
    }
  const body ={
    ...this.citacionForm.value,

  }
  this.CitacionesService.postCitar(body).subscribe({
    next: (body) => {
      this.idCitacion = body.id;
      toast.success('Citacion Guardada con Éxito', {
                duration: 3000,
              });
      this.pdfDisabled = false;
        this.guardarDisabled = true;


          },error(err) {

      toast.error('Error al guardar', {
        duration: 3000,
      description:`${err}`
      });

  }

  })

}
generarPdf(){

    this.CitacionesService.crearpdfBlob(this.idCitacion).subscribe((res: Blob) => {
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab('2');
  }



}
export default CrearCitacionesComponent
