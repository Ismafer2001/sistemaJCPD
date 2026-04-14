import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { finalize } from 'rxjs/operators';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder,
   FormGroup,
    Validators,
     ReactiveFormsModule,
      FormArray,
      FormsModule } from '@angular/forms';
import { AudienciaContestacionService } from '../../services/audienciaContestacion.service';
import { UserService } from '@admin/services/user.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { TablaParticipantesComponent } from './tablaParticipantes/tablaParticipantes.component';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import InputsComponent from '@shared/components/inputs/inputs.component';

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
      FormsModule,
      ButtonSubmitComponent,
      TablaParticipantesComponent,
    NavFormularioComponent,
  InputsComponent,
RouterLink]


})
export class Crear_audienciaComponent implements OnInit {
    // Loader para botones de Participantes
    loadingBtnParticipante: boolean = false;
    loadingBtnParticipanteMsg: string = '';
  // Propiedades para manejar tipos de participantes

//--- Configuración de tabs------//
  tabsConfig: any[] = [
    {
      id: 0,
      label: 'Inicio'
    },
    {
      id: 1,
      label: 'Participantes'
    },
    {
      id: 2,
      label: 'Manifiestaciones'
    },
    {
      id: 3,
      label: 'Conciliacion'
    },
    {
      id: 4,
      label: 'Pdf'
    }
  ];
  currentTab = 0; //variable para cambiar pestañas del formulario
// Configuración de botones de acción
  actionsConfig: any[] = [
    {
      id: 'update',
      type: 'button',
      icon: `<path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />`,
      tooltip: 'Actualizar denuncia',
      hoverClass: 'hover:bg-blue-700 hover:text-white',
      disabled: true
    },
    {
      id: 'save',
      type: 'button',
      icon: `<path fill-rule="evenodd" d="M3.75 3.375c0-1.036.84-1.875 1.875-1.875h11.47c.497 0 .974.197 1.326.548l2.905 2.905c.351.352.549.829.549 1.326V20.25c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375Zm14.625-.375v4.5c0 .621-.504 1.125-1.125 1.125h-10.5A1.125 1.125 0 0 1 5.625 7.5V3h12.75Zm-12.75 9.75c0-.621.504-1.125 1.125-1.125h10.5c.621 0 1.125.504 1.125 1.125v5.625c0 .621-.504 1.125-1.125 1.125H6.75a1.125 1.125 0 0 1-1.125-1.125v-5.625Z" clip-rule="evenodd"/>
<path d="M15.75 3h1.5v3.75h-1.5V3Z" fill="currentColor"/>
<path d="M8.25 15h7.5v1.5h-7.5V15Zm0 2.25h7.5v1.5h-7.5v-1.5Z" fill="currentColor"/>`,
      tooltip: 'Guardar denuncia',
      hoverClass: 'hover:bg-green-600 hover:text-white',
      disabled: false
    },
    {
      id: 'pdf',
      type: 'button',
      icon: `<path d="M14.25 1.5v4.875c0 .621.504 1.125 1.125 1.125h4.875M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V7.5L14.25 1.5H9Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
<rect x="6" y="9" width="12" height="5" rx="0.5" fill="currentColor"/>
<path d="M7.5 10.5h1.2c.5 0 .8.3.8.8s-.3.8-.8.8h-.7v1h-.5v-2.6Zm.5.5v.8h.7c.2 0 .3-.1.3-.4s-.1-.4-.3-.4h-.7ZM10.5 10.5h1c.8 0 1.3.5 1.3 1.3s-.5 1.3-1.3 1.3h-1v-2.6Zm.5.5v1.6h.5c.4 0 .8-.2.8-.8s-.4-.8-.8-.8h-.5ZM14 10.5h2v.5h-1.5v.5h1.2v.5h-1.2v1h-.5v-2.5Z" fill="white"/>
<path d="M12 16v5m0 0l-2.5-2.5M12 21l2.5-2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      tooltip: 'Generar PDF',
      hoverClass: 'hover:bg-green-600 hover:text-white',
      disabled: true
    }
  ];

  // Formulario para agregar manifestación a un participante
  formManifestacion!: FormGroup;
  grupo: string = 'nna';
  denunciaId = 0;
  audienciaForm!: FormGroup;
  participantesForm!: FormGroup;
  participantes: involucrados[] = [];
  datosAudiencia: any;
  miembrosPrincipales: any[] = [];
  pdfSrc: SafeResourceUrl | null = null;
  idAudienciaC!: number;
  existeAudienciaPrueba: any = null;
  isEditAudienciaActivate:boolean=false;

  editMode: boolean = false;

  audienciaContestacionCargada:any=null

  // Propiedades de loading
  initialLoading: boolean = false;
  pdfLoading: boolean = false;
  pdfError: string | null = null;
  loading: boolean = false; // Loader principal para guardar/actualizar
  loadingMessage: string = ''; // Mensaje del loader principal

  // Propiedades para manejar tipos de participantes
  private _tipoParticipante: 'persona' | 'institucion' | 'proyecto' | '' = '';

  get tipoParticipante(): 'persona' | 'institucion' | 'proyecto' | '' {
    return this._tipoParticipante;
  }

  set tipoParticipante(value: 'persona' | 'institucion' | 'proyecto' | '') {
    this._tipoParticipante = value;
    if (value !== '') {
      this.actualizarValidacionesPorTipo(value as 'persona' | 'institucion' | 'proyecto');

      // Establecer valor por defecto automáticamente según el tipo
      if (value === 'institucion') {
        this.participantesForm?.get('tipoParticipante')?.setValue('Representante Institucional');
      } else if (value === 'proyecto') {
        this.participantesForm?.get('tipoParticipante')?.setValue('Representante Proyecto');
      } else if (value === 'persona') {
        // Para persona, limpiar el valor para que deba ser seleccionado manualmente
        this.participantesForm?.get('tipoParticipante')?.setValue('');
      }
    }
  }


  // Nuevas propiedades para el modo edición de participantes
  modoEdicionParticipante: boolean = false;
  participanteEnEdicionIndex: number = -1;
  datosOriginalesParticipante: any = null;

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
//suscribir a los parámetros de la ruta para determinar el modo (crear/editar) y estableer el estado de los botones iniciales
  private configureEditCreateMode(): void {


    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;
        this.audienciaForm.disable();
        this.participantesForm.disable();
         // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
        this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      };

      // Cargar afectados y datos solo después de inicializar formularios
      if(!this.editMode){
        this.cargarAfectadosYDirigidoA();

      }

      this.cargarDatosAudiencia();

      // asignar idDenuncia en el form de participantes
      this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
    });
}


  ngOnInit() {
    this.initialLoading = true;  
    // Inicializar formularios primero (para que patchValue y valueChanges funcionen)
    this.formularioAudienciaContestacion();
    this.formularioParticipantes();
    this.configureEditCreateMode();

    this.loadPrincipalesActivos();

    ;
  }

  private checkInitialLoadingComplete(): void {
    // Verificar si todos los datos necesarios están cargados
    if (this.datosAudiencia &&
        this.miembrosPrincipales.length > 0 &&
        this.participantesArray.length > 0 &&
        this.audienciaForm.get('codigoTramite')?.value) {
      this.initialLoading = false;
    }
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
      existeConciliacion: ['no'],
      conciliacion: [''],

      seRatifica: ['no', Validators.required],

      afectadoManifiesta: ['', Validators.required],

      participantes: this.fb.array([], Validators.required)
    });
  }

  formularioParticipantes() {
    this.participantesForm = this.fb.group({
      // Campos comunes
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      tipoParticipante: ['', Validators.required],
      asistio: [false],
      manifiesta: [''],
      idDenuncia: [this.denunciaId],
      justifico: [false],
      // Campos específicos de institución
      institucion: [''],
      cargo: [''],
      // Campo específico de proyecto
      nombre_proyecto: ['']
    });

    // Listener para cambios en el selector de tipo de participante que actualice las validaciones
    // Esto se ejecutará cuando cambie this.tipoParticipante desde el template
  }


  actualizarValidacionesPorTipo(tipo: 'persona' | 'institucion' | 'proyecto') {
    // Limpiar validaciones específicas
    this.participantesForm.get('institucion')?.clearValidators();
    this.participantesForm.get('cargo')?.clearValidators();
    this.participantesForm.get('nombre_proyecto')?.clearValidators();
    this.participantesForm.get('tipoParticipante')?.clearValidators();

    // Aplicar validaciones según el tipo
    if (tipo === 'institucion') {
      this.participantesForm.get('institucion')?.setValidators([Validators.required]);
      this.participantesForm.get('cargo')?.setValidators([Validators.required]);
      // Para institución no es requerido el tipoParticipante específico
    } else if (tipo === 'proyecto') {
      this.participantesForm.get('nombre_proyecto')?.setValidators([Validators.required]);
      // Para proyecto no es requerido el tipoParticipante específico
    } else if (tipo === 'persona') {
      // Solo para persona es requerido seleccionar el tipo específico
      this.participantesForm.get('tipoParticipante')?.setValidators([Validators.required]);
    }

    // Actualizar estado de validaciones
    this.participantesForm.get('institucion')?.updateValueAndValidity();
    this.participantesForm.get('cargo')?.updateValueAndValidity();
    this.participantesForm.get('nombre_proyecto')?.updateValueAndValidity();
    this.participantesForm.get('tipoParticipante')?.updateValueAndValidity();
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
    this.audienciaContestacionService.getAfectadosYDirigidoA(this.denunciaId).subscribe({
      next: (data) => {
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
            cargo: [p.cargo || ''],
            institucion: [p.institucion || ''],
            nombre_proyecto: [p.nombre_proyecto || p.nombreProyecto || ''],
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
      this.checkInitialLoadingComplete();
    },
    error: (err) => {
      console.error('Error al cargar afectados:', err);
      this.initialLoading = false;
    }
  });
  }

  cargarDatosAudiencia() {
    if (!this.denunciaId) return;

    this.audienciaContestacionService.getDatosAudiencia(this.denunciaId).subscribe({
      next: (data) => {
        this.datosAudiencia = data;
        this.idAudienciaC = data.id;
        console.log('Datos de audiencia cargados', data);
        if (this.editMode) {
          this.audienciaContestacionEditMode();
        } else {
          this.audienciaForm.patchValue({
            codigoTramite: this.datosAudiencia.codigoTramite,
            Hora: this.datosAudiencia.horaCitacion,
            fecha: this.datosAudiencia.fechaCitacion ? new Date(this.datosAudiencia.fechaCitacion).toISOString().substring(0, 10) : '',
            instalacionAudiencia: this.datosAudiencia.articulo,
          });
          this.checkInitialLoadingComplete();
        }
      },
      error: (err) => {
        console.error('Error al cargar datos de audiencia:', err);
        this.initialLoading = false;
      }
    });
  }
   loadPrincipalesActivos(){
    this.UserService.usuariosActivos().subscribe({
      next: (n) => {
        this.miembrosPrincipales=n;
        this.checkInitialLoadingComplete();
      },
      error: (err) => {
        console.error('Error al cargar miembros principales:', err);
        this.initialLoading = false;
      }
    })
  }

audienciaContestacionEditMode()
{
  this.audienciaContestacionService.getAudienciaContestacionEditMode(this.idAudienciaC).subscribe({
    next: (data) => {
      this.audienciaContestacionCargada = data;
      this.existeAudienciaPrueba = data?.idAudienciaPruebas ?? null;
       // Actualizar estados después de cargar audiencia prueba

      // Mostrar toast si existe audiencia prueba
      if(this.existeAudienciaPrueba){
        this.actionsConfig[0].disabled = true
        this.audienciaForm.disable();

        toast.warning('No puedes editar esta audiencia de contestación', {
          duration: 10000,
          description: 'Ya existe una audiencia de prueba asociada a esta audiencia de contestación',
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
        existeConciliacion: (data?.conciliacion && data.conciliacion.trim() !== '') ? 'si' : 'no',
        conciliacion: data?.conciliacion ?? '',
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
      this.checkInitialLoadingComplete();
    },
    error: (err) => {
      console.error('Error al cargar audiencia en modo edición:', err);
      this.initialLoading = false;
    }
  });
}

//---------------------------OTROS-------------------//
  cambiarTab(tab: number) {
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
regresar(): void {
    this.router.navigate(['/nna/fases/'+ this.datosAudiencia?.id]);
  }
   handleAction(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if (this.editMode) {
          this.updateAudiencia();
        }else{
          this.submitAudienciaContestacion();
        }

        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
   habilitarEdicion(){
    this.isEditAudienciaActivate=true;
    this.audienciaForm.enable();
    this.participantesForm.enable();
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;

  }

   //--editar
    updateAudiencia() {
    // Activar loader
    this.loading = true;
    this.loadingMessage = 'Actualizando audiencia...';

    const body ={
      ...this.audienciaForm.value,idDenuncia: this.denunciaId
    }
    this.audienciaContestacionService.actualizarAudienciaContestacion(this.idAudienciaC, body).subscribe({
      next: () => {
        this.loading = false; // Desactivar loader
        toast.success('Audiencia Actualizada con Éxito', {
          duration: 3000,
        });
         this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditAudienciaActivate=false;
    this.audienciaForm.disable();
    this.participantesForm.disable();

      },
      error: (err) => {
        this.loading = false; // Desactivar loader
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

  // Activar loader
  this.loading = true;
  this.loadingMessage = 'Guardando audiencia...';

  const body ={
    ...this.audienciaForm.value,idDenuncia: this.denunciaId

  }

  this.audienciaContestacionService.postaudienciaContestacion(body).subscribe({
    next: (body) => {
      this.loading = false; // Desactivar loader
      this.idAudienciaC = body.id;
      toast.success('Audiencia Guardada con Éxito', {
                duration: 3000,
              });

              this.router.navigate(['../../editar/'+ this.denunciaId], { relativeTo: this.route });




    },
    error: (err) => {
      this.loading = false; // Desactivar loader
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

    this.loadingBtnParticipante = true;
    this.loadingBtnParticipanteMsg = 'Agregando participante...';
    const body = {
      ...this.participantesForm.value,
    };

    this.audienciaContestacionService.postCrearParticipante(body)
      .pipe(finalize(() => {
        this.loadingBtnParticipante = false;
        this.loadingBtnParticipanteMsg = '';
      }))
      .subscribe({
        next: () => {
          this.participantesArray.push(this.fb.group({ ...this.participantesForm.value }));
          this.participantes = this.participantesArray.getRawValue();
          this.resetFormularioParticipantes();
          toast.success('Participante agregado correctamente');
        },
        error: (err) => {
          toast.error('Error al agregar participante', { duration: 3000, description: err });
        }
      });
  }

  resetFormularioParticipantes() {
    this.participantesForm.reset();
    this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
    this.participantesForm.get('asistio')?.setValue(false);
    this.participantesForm.get('justifico')?.setValue(false);

    // Re-aplicar el valor de tipoParticipante para que el setter establezca los valores por defecto
    if (this.tipoParticipante !== '') {
      const currentTipo = this.tipoParticipante;
      this._tipoParticipante = ''; // Limpiar temporalmente
      this.tipoParticipante = currentTipo; // Re-establecer para activar el setter
    }
  }

  //-----------MÉTODOS PARA EDITAR/ELIMINAR PARTICIPANTES---///

  /**
   * Editar participante - Carga los datos en el formulario y cambia a modo edición
   */
  editarParticipante(item: any, index: number) {
    // Verificar que el índice sea válido
    if (index < 0 || index >= this.participantesArray.length) {
      toast.error('Error: Participante no encontrado');
      return;
    }

    // Guardar datos originales para poder cancelar
    const participanteControl = this.participantesArray.at(index);
    this.datosOriginalesParticipante = { ...participanteControl.value };

    // Activar modo edición
    this.modoEdicionParticipante = true;
    this.participanteEnEdicionIndex = index;

    // Determinar el tipo de participante y establecer la propiedad tipoParticipante
    const tipoParticipante = item.tipoParticipante || '';

    if (tipoParticipante.toLowerCase().includes('institucional') || tipoParticipante.toLowerCase().includes('institucion')) {
      this.tipoParticipante = 'institucion';
    } else if (tipoParticipante.toLowerCase().includes('proyecto') || tipoParticipante.toLowerCase().includes('servicio')) {
      this.tipoParticipante = 'proyecto';
    } else {
      this.tipoParticipante = 'persona';
    }

    // Cargar todos los datos en el formulario único
    this.participantesForm.patchValue({
      nombres: item.nombres || '',
      apellidos: item.apellidos || '',
      cedula: item.cedula || '',
      tipoParticipante: item.tipoParticipante || '',
      asistio: item.asistio || false,
      justifico: item.justifico || false,
      manifiesta: item.manifiesta || '',
      idDenuncia: item.idDenuncia || this.denunciaId,
      // Campos específicos
      institucion: item.institucion || '',
      cargo: item.cargo || '',
      nombre_proyecto: item.nombre_proyecto || item.nombreProyecto || ''
    });

    toast.info('Modo edición activado', {
      duration: 2000,
      description: `Editando: ${item.nombres} ${item.apellidos}`
    });
  }

  /**
   * Actualizar participante - Guarda los cambios del participante en edición
   */
  actualizarParticipante() {
    if (this.participantesForm.invalid) {
      this.participantesForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        duration: 3000,
        description: 'Por favor, completa todos los campos requeridos'
      });
      return;
    }

    if (!this.modoEdicionParticipante || this.participanteEnEdicionIndex === -1) {
      toast.error('Error: No hay participante en edición');
      return;
    }

    this.loadingBtnParticipante = true;
    this.loadingBtnParticipanteMsg = 'Actualizando participante...';
    setTimeout(() => {
      // Obtener el control del participante en edición
      const participanteControl = this.participantesArray.at(this.participanteEnEdicionIndex);
      // Actualizar con todos los valores del formulario
      participanteControl.patchValue(this.participantesForm.value);
      // Salir del modo edición
      this.cancelarEdicionParticipante();
      this.loadingBtnParticipante = false;
      this.loadingBtnParticipanteMsg = '';
      toast.success('Participante actualizado correctamente', {
        duration: 3000,
        description: 'Los cambios han sido guardados'
      });
    }, 800);
  }

  /**
   * Cancelar edición - Restaura el formulario y sale del modo edición
   */
  cancelarEdicionParticipante() {
    this.loadingBtnParticipante = true;
    this.loadingBtnParticipanteMsg = 'Cancelando...';
    setTimeout(() => {
      // Restaurar datos originales si es necesario
      if (this.datosOriginalesParticipante && this.participanteEnEdicionIndex !== -1) {
        const participanteControl = this.participantesArray.at(this.participanteEnEdicionIndex);
        participanteControl.patchValue(this.datosOriginalesParticipante);
      }

      // Resetear el formulario único
      this.resetFormularioParticipantes();

      // Limpiar el tipo de participante para ocultar formularios
      this.tipoParticipante = '';

      // Salir del modo edición
      this.modoEdicionParticipante = false;
      this.participanteEnEdicionIndex = -1;
      this.datosOriginalesParticipante = null;

      // Actualizar array local
      this.participantes = this.participantesArray.getRawValue();

      this.loadingBtnParticipante = false;
      this.loadingBtnParticipanteMsg = '';
      toast.info('Edición cancelada');
    }, 600);
  }
  /**
   * Eliminar participante del array
   */
  eliminarParticipante(item: any, index: number) {
    // Verificar que el índice sea válido
    if (index < 0 || index >= this.participantesArray.length) {
      toast.error('Error: Participante no encontrado');
      return;
    }

    // Confirmar eliminación
    if (!confirm(`¿Está seguro de eliminar a ${item.nombres} ${item.apellidos}?`)) {
      return;
    }

    // Si estamos eliminando el participante que se está editando, cancelar edición
    if (this.modoEdicionParticipante && this.participanteEnEdicionIndex === index) {
      this.cancelarEdicionParticipante();
    }

    // Si eliminamos un participante antes del que estamos editando, ajustar índice
    if (this.modoEdicionParticipante && this.participanteEnEdicionIndex > index) {
      this.participanteEnEdicionIndex--;
    }

    // Eliminar del FormArray
    this.participantesArray.removeAt(index);

    // Actualizar el array local
    this.participantes = this.participantesArray.getRawValue();

    toast.success('Participante eliminado correctamente', {
      duration: 3000,
      description: `${item.nombres} ${item.apellidos} ha sido eliminado`
    });
  }

  //-----------PDF------------------//
  generarPdf(){
    this.pdfLoading = true;
    this.pdfError = null;
    this.pdfSrc = null;
    this.actionsConfig[2].disabled = true;

    this.audienciaContestacionService.crearpdfBlob(this.idAudienciaC).subscribe({
      next: (res: Blob) => {
        if (res && res.size > 0) {
          const url = URL.createObjectURL(res);
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.pdfLoading = false;
          this.actionsConfig[2].disabled = false;
        } else {
          this.pdfError = 'No se pudo generar el PDF. No hay datos suficientes.';
          this.pdfLoading = false;
          this.actionsConfig[2].disabled = false;
        }
      },
      error: (err) => {
        console.error('Error al generar PDF:', err);
        this.pdfError = 'Error al generar el PDF. Por favor intente nuevamente.';
        this.pdfLoading = false;
        this.actionsConfig[2].disabled = false;
      }
    });
    this.cambiarTab(4);
  }
}

export default Crear_audienciaComponent;
