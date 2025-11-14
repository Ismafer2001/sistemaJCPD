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
  asistio?: boolean,
  justifico?: boolean
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

  // Estados internos para los botones (sin la lógica de audiencia de prueba)
  private _pdfDisabled: boolean = true;
  private _guardarDisabled: boolean = false;
  private _editarDisabled: boolean = true;
  private cargandoDatosEdicion = false; // Flag para ignorar cambios durante carga

  // Estados para los botones que se calculan explícitamente
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;

  existeAudienciaPrueba: any = null;

  // Método para actualizar los estados de los botones
  private actualizarEstadoBotones(): void {
    // PDF: Si existe audiencia de prueba, siempre activo. Si no, respeta el estado manual
    this.pdfDisabled = this.existeAudienciaPrueba ? false : this._pdfDisabled;

    // Guardar: Si existe audiencia de prueba, siempre deshabilitado. Si no, respeta el estado manual
    this.guardarDisabled = this.existeAudienciaPrueba ? true : this._guardarDisabled;

    // Editar: Si existe audiencia de prueba, siempre deshabilitado. Si no, respeta el estado manual
    this.editarDisabled = this.existeAudienciaPrueba ? true : this._editarDisabled;
  }
  idAudienciaC!: number;

  editMode: boolean = false;
  ignoreFirstValueChangeAvocatoria: boolean = false;
  audienciaContestacionCargada:any=null
  // snapshot of the form after loading in edit mode
  private initialAudienciaSnapshot: any = null;

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
    // Inicializar formularios primero (para que patchValue y valueChanges funcionen)
    this.formularioAudienciaContestacion();
    this.formularioParticipantes();

    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;
        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
        this._guardarDisabled = true;
        this._pdfDisabled = false;
        this._editarDisabled = true;
        this.actualizarEstadoBotones();
        // prevent the first programmatic patch from toggling buttons
        this.ignoreFirstValueChangeAvocatoria = true;
      }

      // Cargar afectados y datos solo después de inicializar formularios
      if(!this.editMode){
        this.cargarAfectadosYDirigidoA();

      }

      this.cargarDatosAudiencia();

      // asignar idDenuncia en el form de participantes
      this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
    });

    this.principalesActivos();

    this.audienciaForm.valueChanges.subscribe(() => {
      // If we're in edit mode but the initial snapshot is not ready yet, ignore programmatic changes
      if (this.editMode) {
        if (this.initialAudienciaSnapshot === null) {
          // still loading initial data -> do not toggle
          return;
        }

        // Ignorar cambios mientras estamos cargando datos de edición
        if (this.cargandoDatosEdicion) {
          return;
        }

        try {
          const current = this.audienciaForm.getRawValue();
          const same = JSON.stringify(current) === JSON.stringify(this.initialAudienciaSnapshot);
          if (same) return; // no user changes yet
          this._pdfDisabled = true;
          this._editarDisabled = false;
          this.actualizarEstadoBotones();
          return;
        } catch (e) {
          // fallback: use ignore flag once
          if (this.ignoreFirstValueChangeAvocatoria) { this.ignoreFirstValueChangeAvocatoria = false; return; }
          this._pdfDisabled = true;
          this._editarDisabled = false;
          this.actualizarEstadoBotones();
          return;
        }
      }
      // Creation mode: keep previous behavior (only toggle after saved)
      if (!this.guardarDisabled) return; // Solo si ya se guardó
      this._pdfDisabled = true;
      this._editarDisabled = false;
      this.actualizarEstadoBotones();
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
      idDenuncia: [this.denunciaId || 0, Validators.required],
      codigoTramite: ['', Validators.required],
      hora: ['', Validators.required],
      fecha: ['', Validators.required],
      instalacionAudiencia: ['', Validators.required],
      dirigue: ['', Validators.required],
      indica: ['', Validators.required],
      manifiesta: ['', Validators.required],

      seRatifica: ['no', Validators.required],

      afectadoManifiesta: ['', Validators.required],

      participantes: this.fb.array([], Validators.required)
    });
  }

  formularioParticipantes() {
    this.participantesForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      tipoParticipante: ['', Validators.required],
      asistio: [false, Validators.required],
      manifiesta: ['', ],
      idDenuncia: [this.denunciaId],
      justifico: [false],
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
      .map((p: any, index: number) => ({
        id: index, // Agregar ID para identificar el elemento
        nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
        manifiesta: p.manifiesta || '',
        participanteIndex: this.participantesArray.controls.findIndex(ctrl =>
          ctrl.value.nombres === p.nombres &&
          ctrl.value.apellidos === p.apellidos &&
          ctrl.value.manifiesta === p.manifiesta
        )
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
        toast.success('Manifestación agregada correctamente');
      }
    }
  }

  // Método para eliminar manifestación
  eliminarManifestacion(item: any) {
    if (item && item.participanteIndex !== undefined && item.participanteIndex >= 0) {
      const participanteCtrl = this.participantesArray.at(item.participanteIndex);
      if (participanteCtrl) {
        participanteCtrl.get('manifiesta')?.setValue('');
        toast.success('Manifestación eliminada correctamente');
      }
    } else {
      toast.error('Error al eliminar: participante no encontrado');
    }
  }

  // Método para editar manifestación
  editarManifestacion(item: any) {
    if (item && item.participanteIndex !== undefined && item.participanteIndex >= 0) {
      // Cargar los datos en el formulario de manifestación
      this.formManifestacion.patchValue({
        participanteIndex: item.participanteIndex,
        manifiesta: item.manifiesta
      });

      // Limpiar la manifestación actual del participante
      const participanteCtrl = this.participantesArray.at(item.participanteIndex);
      if (participanteCtrl) {
        participanteCtrl.get('manifiesta')?.setValue('');
      }

      toast.info('Manifestación cargada para edición');
    } else {
      toast.error('Error al editar: participante no encontrado');
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
            justifico: [p.justifico || false],
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
      this.idAudienciaC = data.id;
      console.log('Datos de audiencia cargados', data);
      if (this.editMode) {
        this.audienciaContestacionEditMode();

      }
      this.audienciaForm.patchValue({
        codigoTramite: this.datosAudiencia.codigoTramite,
        Hora: this.datosAudiencia.horaCitacion,
        fecha: this.datosAudiencia.fechaCitacion ? new Date(this.datosAudiencia.fechaCitacion).toISOString().substring(0, 10) : '',


        // ...otros campos si es necesario
      });

      // If we're in edit mode we might have set ignoreFirstValueChangeAvocatoria earlier; clear it on next tick
      if (this.editMode) {
        setTimeout(() => { this.ignoreFirstValueChangeAvocatoria = false; }, 0);
      }


    });
  }
   principalesActivos(){
    this.UserService.usuariosActivos().subscribe(n=>{
      this.miembrosPrincipales=n;
      console.log('Miembros principales:', this.miembrosPrincipales);
    })
  }

audienciaContestacionEditMode()
{
  this.cargandoDatosEdicion = true; // Marcar que estamos cargando datos
  this.audienciaContestacionService.getAudienciaContestacionEditMode(this.idAudienciaC).subscribe(data => {
      this.audienciaContestacionCargada = data;
      this.existeAudienciaPrueba = data.idAudienciaPruebas;
      this.actualizarEstadoBotones(); // Actualizar estados después de cargar audiencia de prueba

      // Mostrar toast si existe audiencia de prueba
      if(this.existeAudienciaPrueba){
        this.audienciaForm.disable();
        this.actualizarEstadoBotones();
        toast.warning('No puedes editar esta audiencia de contestación', {
          duration: 10000,
          description: 'Ya existe una audiencia de prueba asociada a esta audiencia',
        });
      }

      console.log('audiencia cargada', this.audienciaContestacionCargada);
      // Patch basic fields into the form (handle different backend keys)
      const codigo = data?.codigoTramite ?? data?.codigo_tramite ?? data?.codigo ?? '';
      const hora = data?.horaCitacion ?? data?.hora_citacion ?? data?.hora ?? data?.Hora ?? '';
      let fechaRaw = data?.fechaCitacion ?? data?.fecha_citacion ?? data?.fecha ?? null;
      let fecha = '';
      if (fechaRaw) {
        try {
          const d = new Date(fechaRaw);
          if (!isNaN(d.getTime())) fecha = d.toISOString().substring(0, 10);
        } catch (e) {
          fecha = String(fechaRaw ?? '');
        }
      }

      this.audienciaForm.patchValue({
        codigoTramite: codigo,
        hora: hora,
        fecha: fecha,
        dirigue: data?.dirigue ?? '',
        indica: data?.indica ?? '',
        manifiesta: data?.manifiesta ?? '',
        seRatifica: data?.seRatifica ?? false,
        afectadoManifiesta: data?.afectadoManifiesta ?? '',
        instalacionAudiencia: data?.instalacionAudiencia ?? ''
      }, { emitEvent: false });

      // Populate participantes FormArray if the backend returned them
      const posibles = data?.participantes ?? data?.participantesRegistrados ?? data?.asistentes ?? data?.afectados ?? [];
      // clear existing
      const arr = this.participantesArray;
      while (arr.length) arr.removeAt(0);

      if (Array.isArray(posibles) && posibles.length) {
        posibles.forEach((p: any) => {
          arr.push(this.fb.group({
            nombres: [p.nombres ?? p.nombre ?? ''],
            apellidos: [p.apellidos ?? ''],
            cedula: [p.cedula ?? p.documento ?? ''],
            tipoParticipante: [p.tipoParticipante ?? p.tipo ?? ''],
            asistio: [!!p.asistio],
            justifico: [!!p.justifico],
            manifiesta: [p.manifiesta ?? ''],
            idDenuncia: [p.idDenuncia ?? this.denunciaId]
          }));
        });
      }

      // sync local copy
      this.participantes = this.participantesArray.getRawValue();

      // take a snapshot of the loaded form so we can detect real user changes
      try {
        this.initialAudienciaSnapshot = JSON.parse(JSON.stringify(this.audienciaForm.getRawValue()));
      } catch (e) {
        this.initialAudienciaSnapshot = this.audienciaForm.getRawValue();
      }

      // clear the ignore flag on next tick so the first user change toggles buttons
      setTimeout(() => { this.ignoreFirstValueChangeAvocatoria = false; }, 0);

      // Marcar que terminó la carga de datos para permitir detectar cambios reales del usuario
      setTimeout(() => {
        this.cargandoDatosEdicion = false;
      }, 100); // Pequeño delay para asegurar que todos los patchValue hayan terminado
    });
}

//---------------------------OTROS-------------------//
   cambiarTab(tab: string) {
    this.currentTab = tab;
  }

  // Maneja el cambio del checkbox de justificación en la tabla
  onJustificoChange(event: {item: any, index: number, value: boolean}) {
    const formArray = this.participantesArray;
    if (formArray && formArray.at(event.index)) {
      formArray.at(event.index).get('justifico')?.setValue(event.value);
      if (this.participantes[event.index]) {
        this.participantes[event.index].justifico = event.value;
      }
    }
  }

  //---------cancelar-------------------//
cancelar(): void {
    this.router.navigate(['/nna/fases/'+ this.datosAudiencia?.id]);
  }

   //--editar
    updateAudiencia() {
    const body ={
      ...this.audienciaForm.value,idDenuncia: this.denunciaId
    }
    this.audienciaContestacionService.actualizarAudienciaContestacion(this.idAudienciaC, body).subscribe({
      next: () => {
        toast.success('Audiencia Actualizada con Éxito', {
          duration: 3000,
        });
        this._pdfDisabled = false;
        this._editarDisabled = true;
        this.actualizarEstadoBotones();
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
    ...this.audienciaForm.value,idDenuncia: this.denunciaId

  }

  this.audienciaContestacionService.postaudienciaContestacion(body).subscribe({
    next: (body) => {
      this.idAudienciaC = body.id;
      toast.success('Audiencia Guardada con Éxito', {
                duration: 3000,
              });
      this._pdfDisabled = false;
      this._guardarDisabled = true;
      this.actualizarEstadoBotones();
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
    if (this.participantesForm.invalid) {
    this.participantesForm.markAllAsTouched();
    toast.error('Formulario inválido', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
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
