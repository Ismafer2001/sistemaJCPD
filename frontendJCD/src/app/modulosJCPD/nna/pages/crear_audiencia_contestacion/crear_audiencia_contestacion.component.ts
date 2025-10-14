import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder,
   FormGroup,
    Validators,
     ReactiveFormsModule,
      FormArray } from '@angular/forms';
import { AudienciaContestacionService } from '../../services/audienciaContestacion.service';
import { UserService } from '@admin/services/user.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { TablaParticipantesComponent } from './tablaParticipantes/tablaParticipantes.component';

interface involucrados{
  nombres: string,
  apellidos: string,
  tipo: string,
  asistio?: boolean
}
@Component({
  selector: 'app-crear_audiencia',
  templateUrl: './crear_audiencia_contestacion.component.html',
  imports: [CommonModule,
     CardFormComponent,
      TablaEditComponent,
      ReactiveFormsModule,
      ButtonSubmitComponent,
      TablaParticipantesComponent]


})
export class Crear_audienciaComponent implements OnInit {



  // Formulario para agregar manifestación a un participante
  formManifestacion!: FormGroup;
  currentTab: string = '0';
  denunciaId = 0;
  audienciaForm!: FormGroup;
  participantesForm!: FormGroup;
  participantes: involucrados[] = [];
  datosAudiencia: any;
  miembrosPrincipales: any[] = [];
  pdfSrc: SafeResourceUrl | null = null;
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;
  idAudienciaC!: number;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private audienciaContestacionService: AudienciaContestacionService,
    private UserService:UserService,
    private sanitizer: DomSanitizer
  ) {
    // Inicializar formManifestacion aquí para evitar error de acceso a 'fb' antes de tiempo
    this.formManifestacion = this.fb.group({
      participanteIndex: [''],
      manifiesta: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      // Cargar afectados y dirigidoA cuando tengamos el idDenuncia
      this.cargarAfectadosYDirigidoA();

      this.cargarDatosAudiencia()

    });
    this.principalesActivos();
    // Inicializar formulario de audiencia
    this.formularioAudienciaContestacion();
    this.formularioParticipantes()

    this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);

    this.audienciaForm.valueChanges.subscribe(value => {
      console.log('Audiencia Form Value Changes:', value);
      // Si el formulario cambia después de guardar, deshabilita PDF y edición
      if (!this.guardarDisabled) return; // Solo si ya se guardó
      this.pdfDisabled = true;
      this.editarDisabled = false;
    });
    this.participantesForm.valueChanges.subscribe(value => {
      console.log('Participantes Form Value Changes:', value);
    });

  }



  // Maneja el cambio del checkbox de asistencia en la tabla
  onAsistioChange(event: {item: any, index: number, value: boolean}) {
    // Actualiza el FormArray de participantes
    const formArray = this.participantesArray;
    if (formArray && formArray.at(event.index)) {
      formArray.at(event.index).get('asistio')?.setValue(event.value);
      // También actualiza el array de participantes para reflejar el cambio en la tabla
      if (this.participantes[event.index]) {
        this.participantes[event.index].asistio = event.value;
      }
    }
  }

//-------------Formularios----------------------//
  formularioAudienciaContestacion() {
    this.audienciaForm = this.fb.group({
      idDenuncia: [this.denunciaId || 0],
      codigoTramite: [''],
      Hora: [''],
      fecha: [''],
      intalacionAudiencia: [''],
      dirigue: [''],
      seIndica: [''],
      manifiesta: [''],

      ratificaInforme: [false],

      afectadoManifiesta: [''],

      participantes: this.fb.array([])
    });
  }

  formularioParticipantes() {
    this.participantesForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      tipoParticipante: ['', Validators.required],
      asistio: [false, Validators.required],
      manifiesta: ['', Validators.required],
      idDenuncia: [this.denunciaId]
    });
  }
  //-------------------------------------------//

    // Devuelve los participantes que no son afectados (para el select de manifestaciones)
  get participantesNoAfectados() {
    return this.participantesArray.controls
      .map((ctrl, idx) => ({ ...ctrl.value, idx }))
      .filter(p => p.tipoParticipante !== 'Afectado');
  }

  get participantesAfectados() {
    return this.participantesArray.controls
      .map((ctrl, idx) => ({ ...ctrl.value, idx }))
      .filter(p => p.tipoParticipante === 'Afectado');
  }
    // Getter para la tabla de manifestaciones (nombre completo y manifiesta)
  get manifestacionesTabla() {
    return this.participantesArray.getRawValue()
      .filter((p: any) => p.manifiesta && p.manifiesta.trim() !== '')
      .map((p: any) => ({
        nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
        manifiesta: p.manifiesta || ''
      }));
  }

  // Método para agregar la manifestación al participante seleccionado
  agregarManifestacionParticipante() {
    const idx = this.formManifestacion.get('participanteIndex')?.value;
    const texto = this.formManifestacion.get('manifiesta')?.value;
    if (idx !== '' && idx !== null && texto) {
      const participanteCtrl = this.participantesArray.at(Number(idx));
      if (participanteCtrl) {
        participanteCtrl.get('manifiesta')?.setValue(texto);
        this.formManifestacion.reset();
      }
    }
  }




  //------GETTER FORMULARIOS//
get participantesArray(): FormArray {
    return this.audienciaForm.get('participantes') as FormArray;
  }




  //------------CARGA DE DATOS-----------------////

  cargarAfectadosYDirigidoA() {
    if (!this.denunciaId) return;
    this.audienciaContestacionService.getAfectadosYDirigidoA(this.denunciaId).subscribe(data => {
      console.log('Afectados y dirigidoA cargados', data);
      // Limpiar el FormArray antes de llenarlo
      while (this.participantesArray.length !== 0) {
        this.participantesArray.removeAt(0);
      }
      if (Array.isArray(data)) {
        data.forEach((p: any) => {
          this.participantesArray.push(this.fb.group({
            nombres: [p.nombres || p.nombre || ''],
            apellidos: [p.apellidos || ''],
            cedula: [p.cedula || ''],
            tipoParticipante: [p.tipoParticipante || p.tipo || ''],
            asistio: [p.asistio || false],
            manifiesta: [p.manifiesta || ''],
            idDenuncia: [p.idDenuncia || this.denunciaId]
          }));
        });

      }
      // Si quieres seguir guardando en this.participantes para otros usos:
      this.participantes = data;
    });
  }

  cargarDatosAudiencia() {
    if (!this.denunciaId) return;
    this.audienciaContestacionService.getDatosAudiencia(this.denunciaId).subscribe(data => {
      this.datosAudiencia = data;
      console.log('Datos de audiencia cargados', data);
      this.audienciaForm.patchValue({
        codigoTramite: this.datosAudiencia.codigoTramite,
        Hora: this.datosAudiencia.horaCitacion,
        fecha: this.datosAudiencia.fechaCitacion ? new Date(this.datosAudiencia.fechaCitacion).toISOString().substring(0, 10) : '',


        // ...otros campos si es necesario
      });


    });
  }
   principalesActivos(){
    this.UserService.usuariosActivos().subscribe(n=>{
      this.miembrosPrincipales=n;
      console.log('Miembros principales:', this.miembrosPrincipales);
    })
  }


//---------------------------OTROS-------------------//
   cambiarTab(tab: string) {
    this.currentTab = tab;
  }

  //---------cancelar-------------------//
cancelar(): void {
    this.router.navigate(['/nna/fases/'+ this.datosAudiencia?.id]);
  }

   //--editar
    updateAudiencia() {
    const body ={
      ...this.audienciaForm.value,


    }
    this.audienciaContestacionService.actualizarAudienciaContestacion(this.idAudienciaC, body).subscribe({
      next: () => {
        toast.success('Audiencia Actualizada con Éxito', {
          duration: 3000,
        });
        this.pdfDisabled = false;
          this.editarDisabled = true;

      },
      error: (err) => {
        toast.error('Error al actualizar la audiencia', {
          duration: 3000,
        });
      }

    })

  }

  //------------GUARDAR AUDIENCIA CONTESTACION---///
  submitAudienciaContestacion() {
  if (this.audienciaForm.invalid) {
    this.audienciaForm.markAllAsTouched();
    toast.error('Formulario inválido', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
  const body ={
    ...this.audienciaForm.value,

  }
  this.audienciaContestacionService.postaudienciaContestacion(body).subscribe({
    next: (body) => {
      this.idAudienciaC = body.id;
      toast.success('Audiencia Guardada con Éxito', {
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

  }})

}

  //------------SUBMIT PARTICIPANTES---///
  onSubmitParticipante(): void {
    const body = {
      ...this.participantesForm.value,
    };
    console.log(body);
    this.audienciaContestacionService.postCrearParticipante(body).subscribe(() => {
      // Agregar al FormArray de audienciaForm
      this.participantesArray.push(this.fb.group({ ...this.participantesForm.value }));
      // Actualizar el array participantes para reflejar el cambio en la tabla
      this.participantes = this.participantesArray.getRawValue();
      this.participantesForm.reset();
      this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
    });
  }
  //-----------PDF------------------//
  generarPdf(){

    this.audienciaContestacionService.crearpdfBlob(this.idAudienciaC).subscribe((res: Blob) => {
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab("3");
  }



}

export default Crear_audienciaComponent
