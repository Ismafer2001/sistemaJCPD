import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import  TablaNavigatorComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { CitacionesService } from '@nna/services/citaciones.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { InputsComponent } from '@shared/components/inputs/inputs.component';

interface involucrados{
  nombres: string;
  parte: string;
  idUsuario?: number;

}
interface notificacion{
  codigoTramite: string;
  Canton:string;
}

@Component({
  selector: 'app-crear-citaciones',
  templateUrl: './crear-citaciones.component.html',
  imports:[TablaNavigatorComponent,
    CardFormComponent,
    CommonModule,
    ReactiveFormsModule,
    ButtonSubmitComponent,
    InputsComponent,
    FormsModule,
  RouterLink]

})
export class CrearCitacionesComponent implements OnInit {

  grupo:string ='nna'
  currentTab='0'
    involucrados:involucrados[]=[]
    otrosInvolucrados: involucrados[] = [];

    // Estados de loading para las tablas
    loadingInvolucrados: boolean = false;
    loadingOtrosInvolucrados: boolean = false;

    tipoNotificado: 'persona' | 'Representante Institucional' | '' = '';

    modoEdicionCitados: boolean = false;

    citar:notificacion={codigoTramite:'',Canton:''};
    denunciaId =0
    citacionForm!:FormGroup;
    nuevoCitadoForm!:FormGroup;
    nuevaInstitucionForm!:FormGroup;
    fechaHoraActual: Date = new Date();
      pdfSrc: SafeResourceUrl | null = null;
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;
  idCitacion!: number;

    itemEnEdicion: any = null;

    loadingBtnCitado: boolean = false;
    loadingBtnCitadoMsg: string = '';

  constructor(private CitacionesService:CitacionesService,
       private route:ActivatedRoute,
       private router:Router,
       private fb:FormBuilder,
       private sanitizer: DomSanitizer) { }

  ngOnInit() {


    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];

    });
    this.formularioCitarInstituciones();
    this.formularioCitarPersona();

    this.loadinvolucrados(this.denunciaId);
    this.loadOtrosInvolucrados(this.denunciaId);
    this.loadCitados(this.denunciaId)
    this.formularioFormatoCitacion();


  }

   //============0000FORMULARIOS=============0//

//========0Formulario del formato general de citaciones===========//
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
//=========Formulario para agregar mas personas a citar=======//
   formularioCitarPersona(){
    this.nuevoCitadoForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      tipoParticipante: ['Otros', Validators.required],

      idDenuncia: [this.denunciaId]
    });
  }
  //==========Formulario para agregar mas instituciones a citar=========//
  formularioCitarInstituciones(){
    this.nuevaInstitucionForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      institucion: ['', Validators.required],
      cargo: ['', Validators.required],
      tipoParticipante: ['Representante Institucional', Validators.required],

      idDenuncia: [this.denunciaId]
    });
  }

  //=================CARGA DE DATOS=================//


  //========Cargar las primeras personas agregadas con anteriodidad o que fueron notificadas=======//
  loadinvolucrados(id:number){
  this.loadingInvolucrados = true;
  this.CitacionesService.getinvolucradosCitaciones(id).subscribe({
    next: (data) => {
      this.involucrados = data;
      this.loadingInvolucrados = false;
      console.log(this.involucrados);
    },
    error: (error) => {
      this.loadingInvolucrados = false;
      console.error('Error al cargar involucrados:', error);
    }
  });

  }
  //=============cargar los datos de los involucrados que se agregaron en esta fase
  loadOtrosInvolucrados(id:number){

  this.loadingOtrosInvolucrados = true;
  this.CitacionesService.getOtrosInvolucrados(id).subscribe({
    next: (data) => {
      this.otrosInvolucrados = data;
      this.loadingOtrosInvolucrados = false;

    },
    error: (error) => {
      this.loadingOtrosInvolucrados = false;
      console.error('Error al cargar otros involucrados:', error);
    }
  });

  }
  //========carga de datos de informacion ya registrada para autocompletar elformato de citaciones=============//
  loadCitados(id:number){
    this.CitacionesService.getcitacioenesDTO(id).subscribe(data=>{
      this.citar=data;
      this.citacionForm.patchValue({
          codigoTramite: this.citar.codigoTramite,

        });
    })
  }


volver(): void {
    this.router.navigate(['/nna/fases/' + this.denunciaId]);
  }



seleccionarParaEditarNotificado(item: any){
    this.modoEdicionCitados = true;
    this.itemEnEdicion = item;

    // Determinar el tipo basado en el tipoParticipante
    if (item.parte === 'Representante Institucional') {
      this.tipoNotificado = 'Representante Institucional';

      // Rellenar formulario de institución
      this.nuevaInstitucionForm.patchValue({
        nombres: item.nombres || '',
        apellidos: item.apellidos || '',
        cedula: item.cedula || '',
        institucion: item.institucion || '',
        cargo: item.cargo || '',
        tipoParticipante: item.parte,
        idDenuncia: this.denunciaId
      });

    } else {
      this.tipoNotificado = 'persona';

      // Rellenar formulario de persona
      this.nuevoCitadoForm.patchValue({
        nombres: item.nombres || '',
        apellidos: item.apellidos || '',
        cedula: item.cedula || '',
        tipoParticipante: item.parte,
        idDenuncia: this.denunciaId
      });
    }

    console.log('Editando notificado:', item);
    console.log('Tipo seleccionado:', this.tipoNotificado);
  }
  editarnotificados(finalize?: () => void): void{
    if (!this.itemEnEdicion) return;
    const formData = this.tipoNotificado === 'Representante Institucional'
      ? this.nuevaInstitucionForm.value
      : this.nuevoCitadoForm.value;
    this.CitacionesService.putOtroCitado(this.itemEnEdicion.idUsuario, formData).subscribe({
      next: (response) => {
        this.loadinvolucrados(this.denunciaId);
        this.loadOtrosInvolucrados(this.denunciaId);
        this.cancelarEdicionNotificado();
        toast.success('actualizado Exitoso')
        if (finalize) finalize();
      },
      error: () => { if (finalize) finalize(); }
    });
  }
  agregarNotificado(finalize?: () => void): void {
    if (this.tipoNotificado === 'persona') {
      const body = {
        ...this.nuevoCitadoForm.value,
      };
      this.CitacionesService.postCrearCitados(body).subscribe({
        next: () => {
          this.loadOtrosInvolucrados(this.denunciaId);
          this.nuevoCitadoForm.reset();
          this.nuevoCitadoForm.get('idDenuncia')?.setValue(this.denunciaId);
          toast.success('Agregado Exitoso')
          if (finalize) finalize();
        },
        error: () => { if (finalize) finalize(); }
      });
    } else if (this.tipoNotificado === 'Representante Institucional') {
      const body = {
        ...this.nuevaInstitucionForm.value,
      };
      this.CitacionesService.postCrearCitados(body).subscribe({
        next: () => {
          this.loadOtrosInvolucrados(this.denunciaId);
          this.nuevaInstitucionForm.reset();
          this.nuevaInstitucionForm.get('idDenuncia')?.setValue(this.denunciaId);
          toast.success('Agregado Exitoso')
          if (finalize) finalize();
        },
        error: () => { if (finalize) finalize(); }
      });
    }
  }
  cancelarEdicionNotificado(): void{
    this.modoEdicionCitados = false;
    this.itemEnEdicion = null;
    this.tipoNotificado = '';

    // Resetear ambos formularios
    this.nuevoCitadoForm.reset();
    this.nuevaInstitucionForm.reset();

    // Restaurar valores por defecto
    this.nuevoCitadoForm.get('idDenuncia')?.setValue(this.denunciaId);
    this.nuevoCitadoForm.get('tipoParticipante')?.setValue('Otros');

    this.nuevaInstitucionForm.get('idDenuncia')?.setValue(this.denunciaId);
    this.nuevaInstitucionForm.get('tipoParticipante')?.setValue('Institucion');

    console.log('Edición cancelada');
  }
   eliminarNotificado(item: any){
    if (confirm('¿Estás seguro de que deseas eliminar este notificado?')) {
      this.CitacionesService.deleteOtroCitado(item.idUsuario).subscribe({
        next: (response) => {
          toast.success('Notificado eliminado correctamente');
          this.loadinvolucrados(this.denunciaId);
          this.loadOtrosInvolucrados(this.denunciaId);
        },
        error: (error) => {
          toast.error('Error al eliminar el notificado');
        }
      });
    }
  }
 onSubmit(): void {
    this.loadingBtnCitado = true;

    const finalize = () => { this.loadingBtnCitado = false; this.loadingBtnCitadoMsg = ''; };
    switch (this.modoEdicionCitados) {
      case true:
        this.editarnotificados(finalize);
        break;
      case false:
        this.agregarNotificado(finalize);
        break;
    }




  }


}
export default CrearCitacionesComponent
