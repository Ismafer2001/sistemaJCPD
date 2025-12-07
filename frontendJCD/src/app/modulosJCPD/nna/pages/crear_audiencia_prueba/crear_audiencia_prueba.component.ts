
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { TablaParticipantesComponent } from '../crear_audiencia_contestacion/tablaParticipantes/tablaParticipantes.component';
import { AudienciaPruebasService } from '@nna/services/audienciaPruebas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@admin/services/user.service';
import { toast } from 'ngx-sonner';
import { ArticuloMedidas, MedidasService } from '@nna/services/medidas.service';
import { AvocatoriaService } from '@nna/services/avocatoria.service';
import { Vulneracion, VulneracionService } from '@nna/services/vulneracion.service';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';

interface involucrados{
  nombres: string,
  apellidos: string,
  tipo: string,

}
interface vulneracionesIdentificadas{
  id: number,
  idAfectado: string,
  idVulneracion: string,
  vulneracion: string,
  Detalles: string,

}

@Component({
  selector: 'app-crear_audiencia_prueba',
  templateUrl: './crear_audiencia_prueba.component.html',
  imports:[CommonModule,
    CardFormComponent,
    TablaEditComponent,
  ButtonSubmitComponent,
  ReactiveFormsModule,

]

})
export class Crear_audiencia_pruebaComponent implements OnInit {
   currentTab:string ='0'

  denunciaId = 0;

  editMediasMode: boolean = false;
  modoEdicionParticipante: boolean = false;
  modoEdicionPruebas: boolean = false;
  modoEdicionTestimonios: boolean = false;
  indexParticipanteEditando: number | null = null;
  indexPruebasEditando: number | null = null;
  indexTestimoniosEditando: number | null = null;
  //variables de formularios//
  audienciaPruebaForm!: FormGroup;
  participantesForm!: FormGroup;
  testimoniosForm!: FormGroup;
  pruebasForm!: FormGroup;
  medidasDefinitivasForm!: FormGroup;
  vulneracionesIdentificadasForm!: FormGroup;
  //-------------------------------//
  afectados: any[] = [{id: 0, nombres: ''}];

  selectedIndex: number | null = null;


  vulneraciones: Vulneracion[] = [];

  medidasDefinitivasArray: any[] = [];

  participantes: involucrados[] = [];
  vulneracionesIdentificadas: vulneracionesIdentificadas[] = [];
  medidasPorArticulo: ArticuloMedidas[] = [];
  datosAudienciaPrueba: any;
  miembrosPrincipales: any[] = [];
  pdfSrc: SafeResourceUrl | null = null;
  // Estados internos para los botones (sin la lógica de resolución)
  private _pdfDisabled: boolean = true;
  private _guardarDisabled: boolean = false;
  private _editarDisabled: boolean = true;
  private cargandoDatosEdicion = false; // Flag para ignorar cambios durante carga

  // Estados para los botones que se calculan explícitamente
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;

  // Método para actualizar los estados de los botones
  private actualizarEstadoBotones(): void {
    const tieneResolucion = this.existeResolucion !== null && this.existeResolucion !== undefined;

    // PDF: Si existe resolución, siempre activo. Si no, respeta el estado manual
    this.pdfDisabled = tieneResolucion ? false : this._pdfDisabled;

    // Guardar: Si existe resolución, siempre deshabilitado. Si no, respeta el estado manual
    this.guardarDisabled = tieneResolucion ? true : this._guardarDisabled;

    // Editar: Si existe resolución, siempre deshabilitado. Si no, respeta el estado manual
    this.editarDisabled = tieneResolucion ? true : this._editarDisabled;
  }

  idAudienciaP!: number;

  editMode: boolean = false;
  ignoreFirstValueChangeAvocatoria: boolean = false;
  existeResolucion: any = null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private audienciaPruebasService: AudienciaPruebasService,
    private UserService:UserService,
    private medidasService: MedidasService,
    private avocatoriaService: AvocatoriaService,
    private vulneracionService: VulneracionService,
    private sanitizer: DomSanitizer) { }



  //inicializa el componente//
  ngOnInit() {

    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;
        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
        this._guardarDisabled = true;
        this._pdfDisabled = false;
        this._editarDisabled = true;
        this.actualizarEstadoBotones();
        this.ignoreFirstValueChangeAvocatoria = true;
      }
      // Cargar afectados y dirigidoA cuando tengamos el idDenuncia
       if(!this.editMode){
        this.cargarAfectadosYDirigidoA();

      }

      this.cargarDatosAudiencia(this.denunciaId)
      this.LoadAfectados(this.denunciaId)


    });
    this.formulariopruebas();
    this.formularioTestimonios();

    this.principalesActivos();
    // Inicializar formulario de audiencia
    this.formularioAudienciaPrueba();
    this.actualizarEstadoBotones();
    this.formularioParticipantes()
    this.formularioMedidasDefinitivas()
    this.formularioVulneracionesIdentificadas()
    //inicialiar carga de datos

    this.cargarMedidas();
    this.loadVulneraciones();
    this.loadVulneracionesIdentificadas(this.vulneracionesIdentificadasForm.get('idAfectado')?.value)
    this.seleccionarMEdida();
    this.seleccionarVulneracion();


    this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);

    // Suscripción inteligente a cambios del formulario
    this.audienciaPruebaForm.valueChanges.subscribe(value => {
      console.log('Audiencia Form Value Changes:', value);
      if (!this.cargandoDatosEdicion) {
        this.actualizarEstadoBotones();
      }
    });
    this.participantesForm.valueChanges.subscribe(value => {
      console.log('Participantes Form Value Changes:', value);
    });
    this.vulneracionesIdentificadasForm.valueChanges.subscribe(value => {
      console.log('Vulneraciones Form Value Changes:', value);
    });
  }


//----------------SECCION VULNERACIONES--------------//
  //formulario vulneraciones identificadas
  formularioVulneracionesIdentificadas() {
    this.vulneracionesIdentificadasForm = this.fb.group({
      idAfectado: ['', Validators.required],
      idVulneracion: ['', Validators.required],
      vulneracion: ['', Validators.required],
      detalles: ['', Validators.required],
    });
  }

 //Carga de datos de vulneraciones identificadas
  loadVulneracionesIdentificadas(id:number){
    if (!id) return;
  this.audienciaPruebasService.getVulneracionesIdentificadas(id)
    .subscribe((data: vulneracionesIdentificadas[]) => {
      this.vulneracionesIdentificadas = data;
      console.log('Vulneraciones Identificadas:', this.vulneracionesIdentificadas);
    });
  }
 //carga de datos de vulneraciones
  loadVulneraciones(): void {
    this.vulneracionService.getVulneraciones().subscribe({
      next: (data) => {
        this.vulneraciones = data;
      },
      error: (error) => {
        console.error('Error al cargar vulneraciones:', error);
      }
    });
  }

//agregar vulneraciones identificadas
agregarVulneracionIdentificada() {
  const body = {
      ...this.vulneracionesIdentificadasForm.value,
    };
    this.audienciaPruebasService.agregarVulneracionIdentificada(body).subscribe(() =>{
      this.loadVulneracionesIdentificadas(this.vulneracionesIdentificadasForm.get('idAfectado')?.value);
    });
}
eliminarVulneracionIdentificada(vulneracion: vulneracionesIdentificadas) {
  const idAfectado = this.vulneracionesIdentificadasForm.get('idAfectado')?.value;
  const id = vulneracion.id;

  this.audienciaPruebasService.eliminarVulneracionIdentificada(id).subscribe(() => {
    // Recargar la lista después de eliminar
    this.loadVulneracionesIdentificadas(idAfectado);
  });
}
   vulnercionIdentificada(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
  if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
  this.loadVulneracionesIdentificadas(afectadoId);

  }
 //funcion para autocompletar el input de vulneraciones del formulario de vulneraciones identificadas
 seleccionarVulneracion() {
  this.vulneracionesIdentificadasForm.get('idVulneracion')!
    .valueChanges
    .subscribe((id: number | string) => {
      const numId = Number(id);
      // Busca el nombre en tu catálogo
      const encontrado = this.vulneraciones
        .find(m => m.id === numId);

      this.vulneracionesIdentificadasForm.patchValue(
        { vulneracion: encontrado?.vulneracion ?? '' },
        { emitEvent: false }
      );
    });

}

//---SECCION MEDIDAS DE PROTECCION------//
 //formulario medidas definitivas
    formularioMedidasDefinitivas() {
   this.medidasDefinitivasForm= this.fb.group({
      idAfectado: ['', Validators.required],
      idMedida: ['', Validators.required],
      medida: ['', Validators.required],
      periodo: ['', Validators.required],
      observaciones: ['', Validators.required],
      id: [],
    });
  }

   //getters de formulario//
  get medidas(): FormArray {
  return this.audienciaPruebaForm.get('medidasDefinitivas') as FormArray;
}
  // Devuelve solo las medidas que pertenecen al afectado actualmente seleccionado
  get filteredMedidas(): any[] {
    const idAfectado = Number(this.medidasDefinitivasForm.get('idAfectado')?.value);
    if (!idAfectado) return [];
    return (this.medidas.value || []).filter((m: any) => Number(m.idAfectado) === idAfectado);
  }

       agregarAfectado(): void {
  if (this.medidasDefinitivasForm.valid) {
    this.medidas.push(this.fb.group(this.medidasDefinitivasForm.value));
    this.medidasDefinitivasForm.reset(); // limpio el form para el siguiente
  } else {
    this.medidasDefinitivasForm.markAllAsTouched(); // para que muestre errores
  }
}

seleccionarMEdida() {
  this.medidasDefinitivasForm.get('idMedida')!
    .valueChanges
    .subscribe((id: number | string) => {
      const numId = Number(id);
      // Busca el nombre en tu catálogo
      const encontrado = this.medidasPorArticulo
        .flatMap(a => a.medidas)
        .find(m => m.id === numId);

      this.medidasDefinitivasForm.patchValue(
        { medida: encontrado?.medida ?? '' },
        { emitEvent: false }
      );
    });

}



  cargarMedidas() {
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
          this.medidasPorArticulo = response.data;
          console.log(this.medidasPorArticulo);
      },
      error: () => {
        console.error('Error al cargar medidas:');
      }
    });
  }

    //-------guardar formualrio---------------//
    medidasDefinitivas(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);

  if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
  this.resetEditor();
  this.loadMedidasporAfectado(afectadoId);


  }
  obtenerMedidasDefinitivasPorAfectado(afectadoId: number): void {
    if (!afectadoId) {
      console.warn('No se puede obtener medidas definitivas: ID de afectado no disponible');
      this.medidasDefinitivasArray = [];
      return;
    }

    console.log('Actualizando medidas definitivas para afectado:', afectadoId);
    this.medidasService.getMedidasDefinitivas(afectadoId).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.afectado)) {
          this.medidasDefinitivasArray = response.afectado;
          console.log('Medidas definitivas actualizadas:', this.medidasDefinitivasArray);
        } else {
          console.warn('Respuesta inesperada del servicio:', response);
          this.medidasDefinitivasArray = [];
        }
      },
      error: (error: any) => {
        console.error('Error al obtener medidas definitivas por afectado:', error);
        this.medidasDefinitivasArray = [];
      }
    });
  }
   loadMedidasporAfectado(afectadoId: number) {
    if (!afectadoId) return;

    // PRIMERO: Verificar si ya existen medidas emergentes para este afectado
    this.medidasService.getMedidasDefinitivas(afectadoId).subscribe({
      next: (responseMedidasDefinitivas: any) => {
        const medidasDefinitivasExistentes = Array.isArray(responseMedidasDefinitivas.afectado) ? responseMedidasDefinitivas.afectado : [];

        if (medidasDefinitivasExistentes.length > 0) {
          // Si ya existen medidas emergentes, solo cargarlas y mostrarlas
          console.log('Ya existen medidas emergentes para este afectado, cargando existentes...');
          this.medidasDefinitivasArray = medidasDefinitivasExistentes;
          console.log('Medidas emergentes existentes cargadas:', this.medidasDefinitivasArray);
        } else {
          // Si NO existen medidas emergentes, entonces cargar y agregar las medidas identificadas
          console.log('No existen medidas emergentes, procediendo a cargar medidas identificadas...');
          this.cargarYAgregarMedidasDefinitivas(afectadoId);
        }
      },
      error: (error: any) => {
        console.error('Error al verificar medidas emergentes existentes:', error);
        // En caso de error, intentar cargar medidas identificadas como fallback
        this.cargarYAgregarMedidasDefinitivas(afectadoId);
      }
    });
  }
  private cargarYAgregarMedidasDefinitivas(afectadoId: number) {
    // Consumir API de medidas identificadas
    this.medidasService.getMedidasEmergentes(afectadoId).subscribe({
      next: (response: any) => {
        console.log('Medidas identificadas obtenidas:', response);

        // Obtener la lista de medidas del afectado
        const medidasEmergentes = Array.isArray(response?.afectado) ? response.afectado : [];

        if (medidasEmergentes.length > 0) {
          // Agregar cada medida una por una como medida definitiva
          this.agregarMedidasDefinitivasIndividualmente(medidasEmergentes, afectadoId);
        } else {
          console.log('No se encontraron medidas identificadas para este afectado');
          // Asegurar que el array esté vacío si no hay medidas
          this.medidasDefinitivasArray = [];
        }
      },
      error: (error: any) => {
        console.error('Error al cargar medidas identificadas:', error);
        this.medidasDefinitivasArray = [];
      }
    });
  }
  private agregarMedidasDefinitivasIndividualmente(medidas: any[], afectadoId: number) {
      if (medidas.length === 0) {
        console.log('No hay medidas identificadas para procesar');
        this.medidasDefinitivasArray = [];
        return;
      }

      console.log(`Procesando ${medidas.length} medidas identificadas para agregar como medidas definitivas`);

      // Crear array de observables para todas las operaciones
      const requests: Observable<any>[] = medidas.map((medida, index) => {
        const medidaDefinitiva = {
          idAfectado: afectadoId,
          idMedida: medida.idMedida || medida.id || null,
          medida: medida.medida || medida.descripcion || '',
          periodo: medida.periodo || '', // Se puede dejar vacío para que el usuario lo complete
          observaciones: medida.observaciones || 'Medida agregada automáticamente desde medidas identificadas'
        };

        // Retornar observable con manejo de errores individual
        return this.medidasService.agregarMedidasDefinitivas(medidaDefinitiva).pipe(
          catchError((error) => {
            console.error(`Error al agregar medida definitiva ${index + 1}:`, error);
            // Retornar un observable con error controlado para que forkJoin no se detenga
            return of({ error: true, medida: medidaDefinitiva, errorDetails: error });
          })
        );
      });

      // Usar forkJoin para esperar a que TODAS las operaciones terminen
      forkJoin(requests).pipe(
        finalize(() => {
          console.log('Todas las operaciones de medidas emergentes han finalizado');
        })
      ).subscribe({
        next: (responses) => {
          // Contar éxitos y errores
          const exitosos = responses.filter(r => !r.error).length;
          const errores = responses.filter(r => r.error).length;

          console.log(`✅ Medidas procesadas: ${exitosos} exitosas, ${errores} con errores`);

          if (exitosos > 0) {
            console.log('Actualizando lista de medidas definitivas...');
            // Ahora SÍ actualizar la lista porque sabemos que las operaciones terminaron
            this.obtenerMedidasDefinitivasPorAfectado(afectadoId);
          } else {
            console.warn('Ninguna medida fue agregada exitosamente');
            this.medidasDefinitivasArray = [];
          }
        },
        error: (error) => {
          console.error('Error crítico en el procesamiento de medidas:', error);
          // En caso de error crítico, intentar cargar las medidas existentes
          this.obtenerMedidasDefinitivasPorAfectado(afectadoId);
        }
      });
    }
    agregarMedida(fg: FormGroup){

      const body = { ...fg.value };
      this.medidasService.agregarMedidasDefinitivas(body).subscribe({
        next: () => {

          this.obtenerMedidasDefinitivasPorAfectado(this.medidasDefinitivasForm.get('idAfectado')?.value);
          this.resetEditor();
          toast.success('Medida agregada con éxito', {
              duration: 3000,
              description: 'La medida se agregó correctamente.',

            });

        },
        error: (error:any) => {
          if (error) {
            toast.warning(error, {
            duration: 3000,

          });

          }else{
            toast.error('Error al agregar medida ', {
              duration: 3000,
              description: 'Intente nuevamente más tarde.',

            });
          }
        }
      });
    }
    eliminarMedida(registro: any): void {
        if (!this.medidas) return;

        this.medidasService.eliminarMedidasDefinitivas(registro.id).subscribe({
          next: () => {
            toast.success('Medida eliminada con éxito', {
              duration: 3000,
            });
            this.obtenerMedidasDefinitivasPorAfectado(this.medidasDefinitivasForm.get('idAfectado')?.value);
          },
          error: (err) => {
            toast.error('Error al eliminar medida', {
              duration: 3000,
              description: err
            });
          }
        })


      }
      SeleccionarParaEditar(registro: any): void {

    if (!this.medidasDefinitivasArray || this.medidasDefinitivasArray.length === 0) return;

    // Cargar los datos del item en el formulario de edición
    this.medidasDefinitivasForm.patchValue({
      idAfectado: registro.idAfectado || registro.id_afectado,
      idMedida: registro.idMedida || registro.id_medida,
      medida: registro.medida || registro.descripcion,
      periodo: registro.periodo,
      observaciones: registro.observaciones,
      id: registro.id
    });

    console.log('id elegido:', registro.id);

    this.editMediasMode = true;
    // Scroll the form container to top so the editor is visible to the user


  }
   actualizarMedida(){
    const fg = this.medidasDefinitivasForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
    return;
  }
      this.medidasService.actualizarMedidasDefinitivas(this.medidasDefinitivasForm.get('id')?.value, this.medidasDefinitivasForm.value).subscribe({
      next: () => {
        toast.success('Medida actualizada con éxito', {
          duration: 3000,
        });
        this.resetEditor();
        this.editMediasMode = false;


        this.obtenerMedidasDefinitivasPorAfectado(this.medidasDefinitivasForm.get('idAfectado')?.value);
      },
      error: (err) => {
        toast.error('Error al actualizar medida', {
          duration: 3000,
          description: err
        });
      }
    });
  }








//--------------------------/////
resetEditor() {
  const afectado = this.medidasDefinitivasForm.get('idAfectado')?.value;
  this.medidasDefinitivasForm.reset({
    idAfectado: afectado,
    idMedida: null,
    medida: '',
    periodo: '',
    observaciones: '',
  });
  this.selectedIndex = null;
}
 // -----------Eliminar una medida aceptando índice o item (flexible)




  //-----SECCION PARTICIPANTES-----//





   //-------------Formularios----------------------//
  formularioAudienciaPrueba() {
    const now = new Date();
    const horaActual = now.toTimeString().slice(0,5); // 'HH:mm'
    const fechaActual = now.toISOString().substring(0,10); // 'YYYY-MM-DD'
    this.audienciaPruebaForm = this.fb.group({
      idDenuncia: [this.denunciaId || 0],
      codigoTramite: [''],
      hora: [horaActual],
      fecha: [fechaActual],
      instalacionAudiencia: [''],
      afectadoManifiesta: [''],
      participantes: this.fb.array([]),
      
    });
  }

  formularioParticipantes() {
    this.participantesForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      tipoParticipante: ['', Validators.required],
      pruebas: [''],
      parte: [''],
      idDenuncia: [this.denunciaId]
    });
  }
  formularioTestimonios() {
    this.testimoniosForm = this.fb.group({
      participanteIndex: [""],
      testimonio: ['', Validators.required],
      parte: ['']
    });
  }
  formulariopruebas() {
    this.pruebasForm = this.fb.group({
      participanteIndex: [""],
      pruebas: ['', Validators.required],
      parte: ['']
    });
  }



  //----------------------------------------////


      //------GETTER FORMULARIOS-------------------//
get participantesArray(): FormArray {
    if (!this.audienciaPruebaForm) {
      return this.fb.array([]);
    }
    const array = this.audienciaPruebaForm.get('participantes') as FormArray;
    return array || this.fb.array([]);
  }

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

  // Getter para la tabla de participantes (todos los participantes del FormArray)
  get participantesTabla() {
    if (!this.participantesArray) {
      return [];
    }
    try {
      return this.participantesArray.getRawValue() || [];
    } catch (error) {
      console.error('Error al obtener participantesTabla:', error);
      return [];
    }
  }
  // Getter para la tabla de testimonios (nombre completo y testimonio)
  get testimoniosTabla() {
    if (!this.participantesArray) {
      return [];
    }
    try {
      return this.participantesArray.getRawValue()
        .filter((p: any) => p && p.testimonio && p.testimonio.trim() !== '')
        .map((p: any) => ({
          nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
          testimonio: p.testimonio || '',
          parte: p.parte || ''
        }));
    } catch (error) {
      console.error('Error al obtener testimoniosTabla:', error);
      return [];
    }
  }
   // Getter para la tabla de pruebas (nombre completo y pruebas)
  get pruebasTabla() {
    if (!this.participantesArray) {
      return [];
    }
    try {
      return this.participantesArray.getRawValue()
        .filter((p: any) => p && p.pruebas && p.pruebas.trim() !== '')
        .map((p: any) => ({
          nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
          pruebas: p.pruebas || '',
          parte: p.parte || ''
        }));
    } catch (error) {
      console.error('Error al obtener pruebasTabla:', error);
      return [];
    }
  }



  // Método para agregar el testimonio al participante seleccionado
  agregarTestimoniosParticipante() {
    if (this.modoEdicionTestimonios && this.indexTestimoniosEditando !== null) {
      this.actualizarTestimonios();
    } else {
      const idx = this.testimoniosForm.get('participanteIndex')?.value;
      const texto = this.testimoniosForm.get('testimonio')?.value;
      const parte = this.testimoniosForm.get('parte')?.value;
      if (idx !== '' && idx !== null && texto) {
        const participanteCtrl = this.participantesArray.at(Number(idx));
        if (participanteCtrl) {
          participanteCtrl.get('testimonio')?.setValue(texto);
          participanteCtrl.get('parte')?.setValue(parte);
          this.testimoniosForm.reset();
        }
      }
    }
  }

  // Editar testimonios
  editarTestimonios(indexOrData: number | any): void {
    let testimonioData: any;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      const index = indexOrData;
      if (!this.testimoniosTabla || index < 0 || index >= this.testimoniosTabla.length) {
        console.error('Índice de testimonios inválido o datos no disponibles');
        return;
      }
      testimonioData = this.testimoniosTabla[index];
    } else {
      // Caso 2: Recibimos un objeto de datos (desde tablaEdit)
      testimonioData = indexOrData;
    }

    if (!testimonioData || !testimonioData.nombreCompleto) {
      console.error('Datos de testimonio incompletos:', testimonioData);
      return;
    }

    // Buscar el participante correspondiente en el array
    const participanteIndex = this.participantesArray.controls.findIndex(ctrl => {
      const nombreCompleto = (ctrl.get('nombres')?.value || '') + ' ' + (ctrl.get('apellidos')?.value || '');
      return nombreCompleto === testimonioData.nombreCompleto;
    });

    if (participanteIndex !== -1) {
      this.testimoniosForm.patchValue({
        participanteIndex: participanteIndex,
        testimonio: testimonioData.testimonio || '',
        parte: testimonioData.parte || ''
      });
      this.modoEdicionTestimonios = true;
      this.indexTestimoniosEditando = participanteIndex;
    } else {
      console.error('No se encontró el participante correspondiente');
    }
  }

  // Actualizar testimonios
  actualizarTestimonios(): void {
    if (this.indexTestimoniosEditando !== null) {
      const testimonio = this.testimoniosForm.get('testimonio')?.value;
      const parte = this.testimoniosForm.get('parte')?.value;
      const participanteCtrl = this.participantesArray.at(this.indexTestimoniosEditando);
      if (participanteCtrl) {
        participanteCtrl.get('testimonio')?.setValue(testimonio);
        participanteCtrl.get('parte')?.setValue(parte);
        this.cancelarEdicionTestimonios();
        toast.success('Testimonios actualizados con éxito', { duration: 3000 });
      }
    }
  }

  // Cancelar edición testimonios
  cancelarEdicionTestimonios(): void {
    this.modoEdicionTestimonios = false;
    this.indexTestimoniosEditando = null;
    this.testimoniosForm.reset();
  }

  // Eliminar testimonios
  eliminarTestimonios(indexOrData: number | any): void {
    let testimonioData: any;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      const index = indexOrData;
      if (!this.testimoniosTabla || index < 0 || index >= this.testimoniosTabla.length) {
        console.error('Índice de testimonios inválido o datos no disponibles');
        return;
      }
      testimonioData = this.testimoniosTabla[index];
    } else {
      // Caso 2: Recibimos un objeto de datos (desde tablaEdit)
      testimonioData = indexOrData;
    }

    if (!testimonioData || !testimonioData.nombreCompleto) {
      console.error('Datos de testimonio incompletos:', testimonioData);
      return;
    }

    // Buscar el participante correspondiente en el array
    const participanteIndex = this.participantesArray.controls.findIndex(ctrl => {
      const nombreCompleto = (ctrl.get('nombres')?.value || '') + ' ' + (ctrl.get('apellidos')?.value || '');
      return nombreCompleto === testimonioData.nombreCompleto;
    });

    if (participanteIndex !== -1) {
      const participanteCtrl = this.participantesArray.at(participanteIndex);
      participanteCtrl.get('testimonio')?.setValue('');
      participanteCtrl.get('parte')?.setValue('');
      toast.success('Testimonios eliminados con éxito', { duration: 3000 });

      // Si estamos editando este testimonio, cancelar edición
      if (this.indexTestimoniosEditando === participanteIndex) {
        this.cancelarEdicionTestimonios();
      }
    } else {
      console.error('No se encontró el participante correspondiente');
    }
  }

   // Método para agregar pruebas al participante seleccionado
  agregarPruebasParticipante() {
    if (this.modoEdicionPruebas && this.indexPruebasEditando !== null) {
      this.actualizarPruebas();
    } else {
      const idx = this.pruebasForm.get('participanteIndex')?.value;
      const pruebas = this.pruebasForm.get('pruebas')?.value;
      const parte = this.pruebasForm.get('parte')?.value;
      if (idx !== '' && idx !== null && pruebas) {
        const participanteCtrl = this.participantesArray.at(Number(idx));
        if (participanteCtrl) {
          participanteCtrl.get('pruebas')?.setValue(pruebas);
          participanteCtrl.get('parte')?.setValue(parte);
          this.pruebasForm.reset();
        }
      }
      console.log('aquiiiiiii'+this.pruebasTabla);
    }
  }

  // Editar pruebas
  editarPruebas(indexOrData: number | any): void {
    let pruebasData: any;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      const index = indexOrData;
      if (!this.pruebasTabla || index < 0 || index >= this.pruebasTabla.length) {
        console.error('Índice de pruebas inválido o datos no disponibles');
        return;
      }
      pruebasData = this.pruebasTabla[index];
    } else {
      // Caso 2: Recibimos un objeto de datos (desde tablaEdit)
      pruebasData = indexOrData;
    }

    if (!pruebasData || !pruebasData.nombreCompleto) {
      console.error('Datos de pruebas incompletos:', pruebasData);
      return;
    }

    // Buscar el participante correspondiente en el array
    const participanteIndex = this.participantesArray.controls.findIndex(ctrl => {
      const nombreCompleto = (ctrl.get('nombres')?.value || '') + ' ' + (ctrl.get('apellidos')?.value || '');
      return nombreCompleto === pruebasData.nombreCompleto;
    });

    if (participanteIndex !== -1) {
      this.pruebasForm.patchValue({
        participanteIndex: participanteIndex,
        pruebas: pruebasData.pruebas || '',
        parte: pruebasData.parte || ''
      });
      this.modoEdicionPruebas = true;
      this.indexPruebasEditando = participanteIndex;
    } else {
      console.error('No se encontró el participante correspondiente');
    }
  }

  // Actualizar pruebas
  actualizarPruebas(): void {
    if (this.indexPruebasEditando !== null) {
      const pruebas = this.pruebasForm.get('pruebas')?.value;
      const parte = this.pruebasForm.get('parte')?.value;
      const participanteCtrl = this.participantesArray.at(this.indexPruebasEditando);
      if (participanteCtrl) {
        participanteCtrl.get('pruebas')?.setValue(pruebas);
        participanteCtrl.get('parte')?.setValue(parte);
        this.cancelarEdicionPruebas();
        toast.success('Pruebas actualizadas con éxito', { duration: 3000 });
      }
    }
  }

  // Cancelar edición pruebas
  cancelarEdicionPruebas(): void {
    this.modoEdicionPruebas = false;
    this.indexPruebasEditando = null;
    this.pruebasForm.reset();
  }

  // Eliminar pruebas
  eliminarPruebas(indexOrData: number | any): void {
    let pruebasData: any;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      const index = indexOrData;
      if (!this.pruebasTabla || index < 0 || index >= this.pruebasTabla.length) {
        console.error('Índice de pruebas inválido o datos no disponibles');
        return;
      }
      pruebasData = this.pruebasTabla[index];
    } else {
      // Caso 2: Recibimos un objeto de datos (desde tablaEdit)
      pruebasData = indexOrData;
    }

    if (!pruebasData || !pruebasData.nombreCompleto) {
      console.error('Datos de pruebas incompletos:', pruebasData);
      return;
    }

    // Buscar el participante correspondiente en el array
    const participanteIndex = this.participantesArray.controls.findIndex(ctrl => {
      const nombreCompleto = (ctrl.get('nombres')?.value || '') + ' ' + (ctrl.get('apellidos')?.value || '');
      return nombreCompleto === pruebasData.nombreCompleto;
    });

    if (participanteIndex !== -1) {
      const participanteCtrl = this.participantesArray.at(participanteIndex);
      participanteCtrl.get('pruebas')?.setValue('');
      participanteCtrl.get('parte')?.setValue('');
      toast.success('Pruebas eliminadas con éxito', { duration: 3000 });

      // Si estamos editando estas pruebas, cancelar edición
      if (this.indexPruebasEditando === participanteIndex) {
        this.cancelarEdicionPruebas();
      }
    } else {
      console.error('No se encontró el participante correspondiente');
    }
  }






   //------------CARGA DE DATOS-----------------////
   LoadAfectados(id: number) {
    this.avocatoriaService.getAfectados(id).subscribe({
      next: (data) => {
        this.afectados = data;

        console.log(this.afectados)
      },
      error: (err) => {
        console.error('Error al cargar los afectados', err);
      }
    });
  }

  cargarAfectadosYDirigidoA() {
    if (!this.denunciaId) return;
    this.audienciaPruebasService.getParticipantesAudiencia(this.denunciaId).subscribe(data => {
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
            pruebas: [p.pruebas || ''],
            testimonio: [p.testimonio || ''],
            parte: [p.parte || ''],
            idDenuncia: [p.idDenuncia || this.denunciaId]
          }));
        });
      }
      // Si quieres seguir guardando en this.participantes para otros usos:
      this.participantes = data;
    });
  }
  cargarDatosAudiencia(id: number) {
    if (!this.denunciaId) return;
    this.audienciaPruebasService.getDatosAudiencia(id).subscribe(data => {
      this.datosAudienciaPrueba = data;
      this.idAudienciaP = data.id;
      console.log('Datos de audiencia cargados', data);
      if (this.editMode) {
        this.audienciaPruebasEditMode(this.idAudienciaP);

      }
      this.audienciaPruebaForm.patchValue({
        codigoTramite: this.datosAudienciaPrueba.codigoTramite,
        // ...otros campos si es necesario
      });


    });
  }
  audienciaPruebasEditMode(id: number){
    this.cargandoDatosEdicion = true;
    this.audienciaPruebasService.getAudienciaPruebaEditMode(id).subscribe(data => {
      console.log('Datos de audiencia para editar cargados', data);
      if (!data) return;

      this.existeResolucion = data?.idResolucion ?? null;
      this.actualizarEstadoBotones(); // Actualizar estados después de cargar resolución

      // Mostrar toast si existe resolución
      if(this.existeResolucion){
        this.audienciaPruebaForm.disable();
        this.actualizarEstadoBotones();
        toast.warning('No puedes editar esta audiencia de prueba', {
          duration: 10000,
          description: 'Ya existe una resolución asociada a esta audiencia de prueba',
        });
      }

      // Patch main fields defensively (support multiple backend keys)
      const codigo = data?.codigoTramite ?? data?.codigo_tramite ?? data?.codigo ?? '';
      const hora = data?.horaCitacion ?? data?.hora_citacion ?? data?.Hora ?? data?.hora ?? '';
      let fechaRaw = data?.fechaCitacion ?? data?.fecha_citacion ?? data?.fecha ?? null;
      let fecha = '';
      if (fechaRaw) {
        try {
          const d = new Date(fechaRaw);
          if (!isNaN(d.getTime())) fecha = d.toISOString().substring(0,10);
        } catch (e) {
          fecha = String(fechaRaw ?? '');
        }
      }

      this.audienciaPruebaForm.patchValue({
        codigoTramite: codigo,
        Hora: hora,
        fecha: fecha,
        instalacionAudiencia: data?.instalacionAudiencia ?? '',
        afectadoManifiesta: data?.afectadoManifiesta ?? '',
      }, { emitEvent: false });

      // Ensure initial button state for edit mode: PDF enabled, Edit disabled
      if (this.editMode) {
        this._pdfDisabled = false;
        this._editarDisabled = true;
        this.actualizarEstadoBotones();
      }
      // Clear the ignore flag on the next tick so the first real user change is handled
      setTimeout(() => { this.ignoreFirstValueChangeAvocatoria = false; }, 0);

      // Marcar que terminó la carga de datos para permitir detectar cambios reales del usuario
      setTimeout(() => {
        this.cargandoDatosEdicion = false;
      }, 100); // Pequeño delay para asegurar que todos los patchValue hayan terminado

      // Populate participantes FormArray if provided
      const posibles = data?.participantes ?? data?.asistentes ?? data?.participantesRegistrados ?? [];
      const arr = this.participantesArray;
      while (arr.length) arr.removeAt(0);
      if (Array.isArray(posibles) && posibles.length) {
        posibles.forEach((p: any) => {
          arr.push(this.fb.group({
            nombres: [p.nombres ?? p.nombre ?? ''],
            apellidos: [p.apellidos ?? ''],
            cedula: [p.cedula ?? p.documento ?? ''],
            tipoParticipante: [p.tipoParticipante ?? p.tipo ?? ''],
            pruebas: [p.pruebas ?? ''],
            testimonio: [p.testimonio ?? ''],
            parte: [p.parte ?? ''],
            idDenuncia: [p.idDenuncia ?? this.denunciaId]
          }));
        });
      }

      // sync local copy
      this.participantes = this.participantesArray.getRawValue();
      // additionally process participantesConTestimonio if backend provides testimonios separately
      const conTest = data?.participantesConTestimonio ?? data?.participantesConTestimonios ?? null;
      if (Array.isArray(conTest) && conTest.length) {
        conTest.forEach((t: any) => {
          // try to find an existing participant control by cedula, id or by matching names
          let idx = -1;
          if (t.cedula) {
            idx = this.participantesArray.controls.findIndex(ctrl => (ctrl.get('cedula')?.value || '') === String(t.cedula));
          }
          if (idx === -1 && (t.id || t.participanteId)) {
            const idVal = t.id ?? t.participanteId;
            idx = this.participantesArray.controls.findIndex(ctrl => Number(ctrl.get('id')?.value) === Number(idVal) || Number(ctrl.get('participanteId')?.value) === Number(idVal));
          }
          if (idx === -1 && (t.nombres || t.apellidos)) {
            idx = this.participantesArray.controls.findIndex(ctrl => {
              const n = (ctrl.get('nombres')?.value || '').toString().trim().toLowerCase();
              const a = (ctrl.get('apellidos')?.value || '').toString().trim().toLowerCase();
              const tn = (t.nombres || '').toString().trim().toLowerCase();
              const ta = (t.apellidos || '').toString().trim().toLowerCase();
              return (tn && tn === n) || (ta && ta === a);
            });
          }

          if (idx !== -1) {
            const fg = this.participantesArray.at(idx);
            fg.get('testimonio')?.setValue(t.testimonio ?? t.texto ?? '');
            fg.get('parte')?.setValue(t.parte ?? '');
          } else {
            // no match: push as new participante entry (with minimum fields)
            this.participantesArray.push(this.fb.group({
              nombres: [t.nombres ?? ''],
              apellidos: [t.apellidos ?? ''],
              cedula: [t.cedula ?? ''],
              tipoParticipante: [t.tipoParticipante ?? ''],
              pruebas: [''],
              testimonio: [t.testimonio ?? t.texto ?? ''],
              parte: [t.parte ?? ''],
              idDenuncia: [this.denunciaId]
            }));
          }
        });
        // resync local copy after applying testimonios
        this.participantes = this.participantesArray.getRawValue();
      }
    })
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
 cancelar(): void {
    this.router.navigate(['/nna/fases/'+ this.datosAudienciaPrueba?.id]);
  }
   //--editar
      updateAudiencia() {
      // Prepare body from form value (use getRawValue if available to include all controls)
      const raw: any = typeof this.audienciaPruebaForm.getRawValue === 'function'
        ? this.audienciaPruebaForm.getRawValue()
        : { ...this.audienciaPruebaForm.value };

      // If we are in edit mode, force medidasDefinitivas to be an empty array
      // so backend receives medidasDefinitivas: [] as requested.
      if (this.editMode) {
        raw.medidasDefinitivas = [];
      }

      const body = raw;
      this.audienciaPruebasService.actualizarAudienciaPrueba(this.idAudienciaP, body).subscribe({
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
      //------------GUARDAR AUDIENCIA PRUEBA---///
  submitAudienciaPrueba() {
  if (this.audienciaPruebaForm.invalid) {
    this.audienciaPruebaForm.markAllAsTouched();
    toast.error('Formulario inválido', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
  const body ={
    ...this.audienciaPruebaForm.value,

  }
  this.audienciaPruebasService.postaudienciaPrueba(body).subscribe({
    next: (body) => {
      this.idAudienciaP = body.id;
      toast.success('Audiencia Guardada con Éxito', {
                duration: 3000,
              });
              this.editMode = true;
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
    if (this.modoEdicionParticipante && this.indexParticipanteEditando !== null) {
      this.actualizarParticipante();
    } else {
      const body = {
        ...this.participantesForm.value,
      };
      console.log(body);
      this.audienciaPruebasService.postCrearParticipante(body).subscribe(() => {
        // Agregar al FormArray de audienciaForm
        this.participantesArray.push(this.fb.group({ ...this.participantesForm.value }));
        // Actualizar el array participantes para reflejar el cambio en la tabla
        this.participantes = this.participantesArray.getRawValue();
        this.participantesForm.reset();
        this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
      });
    }
  }

  // Editar participante
  editarParticipante(indexOrData: number | any): void {
    let index: number;
    let participanteData: any;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      index = indexOrData;
      const participantesData = this.participantesTabla;
      if (!participantesData || index < 0 || index >= participantesData.length) {
        console.error('Índice de participante inválido:', index, 'Total:', participantesData?.length);
        return;
      }
      participanteData = participantesData[index];
    } else {
      // Caso 2: Recibimos un objeto de datos (desde tablaEdit)
      participanteData = indexOrData;
      // Buscar el índice correspondiente en el array
      const participantesData = this.participantesTabla;
      index = participantesData.findIndex(p =>
        p.nombres === participanteData.nombres &&
        p.apellidos === participanteData.apellidos &&
        p.cedula === participanteData.cedula
      );

      if (index === -1) {
        console.error('No se pudo encontrar el participante en el array:', participanteData);
        return;
      }
    }

    // Verificar que el FormArray esté sincronizado
    if (!this.participantesArray || index >= this.participantesArray.length) {
      console.error('FormArray no sincronizado. Index:', index, 'Array length:', this.participantesArray?.length);
      return;
    }

    const participanteControl = this.participantesArray.at(index);
    if (!participanteControl) {
      console.error('Control de participante no encontrado en índice:', index);
      return;
    }

    const participante = participanteControl.value;
    this.participantesForm.patchValue(participante);
    this.modoEdicionParticipante = true;
    this.indexParticipanteEditando = index;
  }

  // Actualizar participante
  actualizarParticipante(): void {
    if (this.indexParticipanteEditando !== null) {
      const participanteActualizado = this.participantesForm.value;
      this.participantesArray.at(this.indexParticipanteEditando).patchValue(participanteActualizado);
      this.participantes = this.participantesArray.getRawValue();
      this.cancelarEdicionParticipante();
      toast.success('Participante actualizado con éxito', { duration: 3000 });
    }
  }

  // Cancelar edición participante
  cancelarEdicionParticipante(): void {
    this.modoEdicionParticipante = false;
    this.indexParticipanteEditando = null;
    this.participantesForm.reset();
    this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
  }

  // Eliminar participante
  eliminarParticipante(indexOrData: number | any): void {
    let index: number;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      index = indexOrData;
    } else {
      // Caso 2: Recibimos un objeto de datos (desde tablaEdit)
      const participanteData = indexOrData;
      // Buscar el índice correspondiente en el array
      const participantesData = this.participantesTabla;
      index = participantesData.findIndex(p =>
        p.nombres === participanteData.nombres &&
        p.apellidos === participanteData.apellidos &&
        p.cedula === participanteData.cedula
      );

      if (index === -1) {
        console.error('No se pudo encontrar el participante a eliminar:', participanteData);
        return;
      }
    }

    // Verificar que el índice sea válido
    if (index < 0 || index >= this.participantesArray.length) {
      console.error('Índice inválido para eliminar participante:', index);
      return;
    }

    this.participantesArray.removeAt(index);
    this.participantes = this.participantesArray.getRawValue();
    toast.success('Participante eliminado con éxito', { duration: 3000 });

    // Si estamos editando el participante que se eliminó, cancelar edición
    if (this.indexParticipanteEditando === index) {
      this.cancelarEdicionParticipante();
    } else if (this.indexParticipanteEditando !== null && this.indexParticipanteEditando > index) {
      this.indexParticipanteEditando--;
    }
  }
  //-----------PDF------------------//
  generarPdf(){

    this.audienciaPruebasService.crearpdfBlob(this.idAudienciaP).subscribe((res: Blob) => {
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab("5");
  }


}
export default Crear_audiencia_pruebaComponent;
