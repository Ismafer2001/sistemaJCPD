import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaComponent from '@shared/components/tabla/tablaNavigator/tabla.component';

import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { AudienciaContestacionService } from '../../services/audienciaContestacion.service';
import { UserService } from '@admin/services/user.service';

interface involucrados{
  nombres: string,
  apellidos: string,
  tipo: string,
  asistio?: boolean
}
@Component({
  selector: 'app-crear_audiencia',
  templateUrl: './crear_audiencia_contestacion.component.html',
  imports: [CommonModule, CardFormComponent, TablaEditComponent, ReactiveFormsModule]


})
export class Crear_audienciaComponent implements OnInit {
  // Getter para la tabla de manifestaciones (nombre completo y manifiesta)
  get manifestacionesTabla() {
    return this.participantesArray.getRawValue()
      .filter((p: any) => p.manifiesta && p.manifiesta.trim() !== '')
      .map((p: any) => ({
        nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
        manifiesta: p.manifiesta || ''
      }));
  }
  // Formulario para agregar manifestación a un participante
  formManifestacion!: FormGroup;

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


  currentTab: string = '0';
  denunciaId = 0;
  audienciaForm!: FormGroup;
  participantesForm!: FormGroup;

  participantes: involucrados[] = [];

  datosAudiencia: any;
  miembrosPrincipales: any[] = [];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private audienciaContestacionService: AudienciaContestacionService,
    private UserService:UserService
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
    });
    this.participantesForm.valueChanges.subscribe(value => {
      console.log('Participantes Form Value Changes:', value);
    });

  }

  //-------------Formularios----------------------//
  formularioAudienciaContestacion() {
    this.audienciaForm = this.fb.group({
      codigoTramite: [''],
      Hora: [''],
      fecha: [''],
      intalacionAudiencia: [''],
      dirigue: [''],
      indica: [''],
      manifiesta: [''],
      idDenuncia: [this.denunciaId || 0],
      participantes: this.fb.array([])
    });
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



}

export default Crear_audienciaComponent
