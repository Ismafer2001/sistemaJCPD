
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { InputsComponent } from '@shared/components/inputs/inputs.component';

import { AudienciaPruebasService } from '@nna/services/audienciaPruebas.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '@admin/services/user.service';
import { toast } from 'ngx-sonner';
import {  Medida, MedidasService } from '@nna/services/medidas.service';
import { AvocatoriaService } from '@nna/services/avocatoria.service';
import { Vulneracion, VulneracionService } from '@nna/services/vulneracion.service';
import { catchError, finalize, forkJoin, Observable, of } from 'rxjs';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import TablaprubeasComponent from './tablaprubeas/tablaprubeas.component';

interface involucrados{
  nombres: string,
  apellidos: string,
  tipo: string,
  asistio?: boolean,
  justifico?: boolean
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
  NavFormularioComponent,
  InputsComponent,
  RouterLink,
  TablaprubeasComponent

]

})
export class Crear_audiencia_pruebaComponent implements OnInit {
  //--- Configuración de tabs------//
  tabsConfig: any[] = [
    {
      id: 0,
      label: 'Inicio'
    },
    {
      id: 1,
      label: 'Pruebas'
    },
    {
      id: 2,
      label: 'Testimonios'
    },
    {
      id: 3,
      label: 'Audiencia reservada'
    },
    {
      id: 4,
      label: 'Vulneraciones/ medidas'
    },
    {
      id: 5,
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
  denunciaId = 0;
  grupo: string = '';
  isEditAudienciaPruebasActivate: boolean = false;
  editMedidasMode: boolean = false;
  isActivateModoEdicionParticipante: boolean = false;
  modoEdicionPruebas: boolean = false;
  modoEdicionTestimonios: boolean = false;
  modoEdicionVulneraciones: boolean = false;
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
  todasLasMedidas: Medida[] = [];
  medidasFiltradas: Medida[] = [];
  cuerposLegalesDisponibles: string[] = [];
  datosAudienciaPrueba: any;
  miembrosPrincipales: any[] = [];
  pdfSrc: SafeResourceUrl | null = null;
  idAudienciaP!: number;
  editMode: boolean = false;
  existeResolucion: any = null;

  // Estado de loading para PDF
  pdfLoading: boolean = false;
  pdfError: boolean = false;
  loading: boolean = false; // Loader principal para guardar/actualizar
  loadingMessage: string = ''; // Mensaje del loader principal

  // Loader para botones de Participantes
  loadingBtnParticipante: boolean = false;
  loadingBtnParticipanteMsg: string = '';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private audienciaPruebasService: AudienciaPruebasService,
    private UserService:UserService,
    private medidasService: MedidasService,
    private avocatoriaService: AvocatoriaService,
    private vulneracionService: VulneracionService,
    private sanitizer: DomSanitizer) { }

    //suscribir a los parámetros de la ruta para determinar el modo (crear/editar) y estableer el estado de los botones iniciales
  private configureEditCreateMode(): void {
  const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';

    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];

      if (params['modo'] === 'editar') {
        console.log('Modo editar activado '+ this.denunciaId);
        this.editMode = true;
        this.audienciaPruebaForm.disable();
        this.participantesForm.disable();
         // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
        this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      };

     // Cargar afectados y dirigidoA cuando tengamos el idDenuncia
       if(!this.editMode){
        console.log('Modo crear activado, cargando afectados y dirigidoA');
        this.cargarAfectadosYDirigidoA();

      }

      this.cargarDatosAudiencia(this.denunciaId)
      this.LoadAfectados(this.denunciaId)
      this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);

    });
}
  //inicializa el componente//
  ngOnInit() {
     this.formulariopruebas();
    this.formularioTestimonios();

    this.principalesActivos();
    // Inicializar formulario de audiencia
    this.formularioAudienciaPrueba();

    this.formularioParticipantes()
    this.formularioMedidasDefinitivas()
    this.formularioVulneracionesIdentificadas()

    this.configureEditCreateMode()

    //inicialiar carga de datos

    this.cargarMedidas();
    this.loadVulneraciones();
    this.loadVulneracionesIdentificadas(this.vulneracionesIdentificadasForm.get('idAfectado')?.value)
    this.seleccionarMEdida();
    this.seleccionarVulneracion();




    // Suscripción inteligente a cambios del formulario
    this.audienciaPruebaForm.valueChanges.subscribe(value => {
      console.log('Audiencia Form Value Changes:', value);

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
      id: [],
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

 SeleccionarParaEditarVulneracion(registro: any): void {



    // Cargar los datos del item en el formulario de edición
    this.vulneracionesIdentificadasForm.patchValue({
      idAfectado: registro.idAfectado || registro.id_afectado,
      idVulneracion: registro.idVulneracion || registro.id_vulneracion,
      vulneracion: registro.vulneracion || registro.descripcion,
      detalles: registro.detalles,
      id: registro.id
    });

    console.log('id elegido:', registro.id);

    this.modoEdicionVulneraciones = true;
    // Scroll the form container to top so the editor is visible to the user


  }
 actualizarVulneracionIdentificada(){
    const fg = this.vulneracionesIdentificadasForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
    return;
  }
      this.audienciaPruebasService.actualizarVulneracionIdentificada(this.vulneracionesIdentificadasForm.get('id')?.value, this.vulneracionesIdentificadasForm.value).subscribe({
      next: () => {
        toast.success('Medida actualizada con éxito', {
          duration: 3000,
        });
        this.resetEditor();
        this.modoEdicionVulneraciones = false;


        this.loadVulneracionesIdentificadas(this.vulneracionesIdentificadasForm.get('idAfectado')?.value);
      },
      error: (err) => {
        toast.error('Error al actualizar medida', {
          duration: 3000,
          description: err
        });
      }
    });
  }

//---SECCION MEDIDAS DE PROTECCION------//
 //formulario medidas definitivas
    formularioMedidasDefinitivas() {
   this.medidasDefinitivasForm= this.fb.group({
      idAfectado: ['', Validators.required],
      cuerpoLegalFiltro: [''], // Campo para filtrar por cuerpo legal
      idMedida: ['', Validators.required],
      medida: ['', Validators.required],
      periodo: ['', Validators.required],
      observaciones: ['', Validators.required],
      id: [],
    });
  }



seleccionarMEdida() {
  this.medidasDefinitivasForm.get('idMedida')!
    .valueChanges
    .subscribe((id: number | string) => {
      const numId = Number(id);
      // Busca el nombre en el catálogo actualizado
      const encontrado = this.medidasFiltradas.find(m => m.id === numId);

      this.medidasDefinitivasForm.patchValue(
        { medida: encontrado?.medida ?? '' },
        { emitEvent: false }
      );
    });

  // Suscribirse a cambios en el filtro de cuerpo legal
  this.medidasDefinitivasForm.get('cuerpoLegalFiltro')?.valueChanges.subscribe(cuerpoLegal => {
    this.filtrarMedidasPorCuerpoLegal(cuerpoLegal);
  });

}

  cargarMedidas() {
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
          this.todasLasMedidas = response.data;

          // Inicializar lista de cuerpos legales únicos para el filtro
          this.cuerposLegalesDisponibles = [...new Set(this.todasLasMedidas.map(medida => medida.cuerpoLegal))];

          // Inicializar medidas filtradas con todas las medidas
          this.inicializarMedidasFiltradas();

          console.log('medidas cargadas:', this.todasLasMedidas);
      },
      error: () => {
        console.error('Error al cargar medidas:');
      }
    });
  }

  // Métodos para el filtrado de medidas
  inicializarMedidasFiltradas(): void {
    // Mostrar todas las medidas disponibles
    this.medidasFiltradas = [...this.todasLasMedidas];
  }

  filtrarMedidasPorCuerpoLegal(cuerpoLegalNombre: string): void {
    if (!cuerpoLegalNombre || cuerpoLegalNombre === '') {
      // Si no hay filtro seleccionado, mostrar todas las medidas
      this.inicializarMedidasFiltradas();
    } else {
      // Filtrar medidas del cuerpo legal seleccionado
      this.medidasFiltradas = this.todasLasMedidas.filter(medida =>
        medida.cuerpoLegal === cuerpoLegalNombre
      );
    }
    // Limpiar selección de medida cuando cambie el filtro
    this.medidasDefinitivasForm.get('idMedida')?.setValue('');
  }

  // Método helper para obtener el nombre del cuerpo legal seleccionado
  getNombreCuerpoLegalSeleccionado(): string {
    return this.medidasDefinitivasForm.get('cuerpoLegalFiltro')?.value || '';
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

          console.log(` Medidas procesadas: ${exitosos} exitosas, ${errores} con errores`);

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

    this.editMedidasMode = true;
    // Scroll the form container to top so the editor is visible to the user


  }
   actualizarMedida(){
    const fg = this.medidasDefinitivasForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
    console.log('Formulario inválido:', fg.errors);
    return;
  }
      this.medidasService.actualizarMedidasDefinitivas(this.medidasDefinitivasForm.get('id')?.value, this.medidasDefinitivasForm.value).subscribe({
      next: () => {
        toast.success('Medida actualizada con éxito', {
          duration: 3000,
        });
        this.resetEditor();
        this.editMedidasMode = false;


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



  //-----SECCION PARTICIPANTES-----//

   //-------------Formularios----------------------//
  formularioAudienciaPrueba() {
    const now = new Date();
    const horaActual = now.toTimeString().slice(0,5); // 'HH:mm'
    const fechaActual = now.toISOString().substring(0,10); // 'YYYY-MM-DD'
    this.audienciaPruebaForm = this.fb.group({
      idDenuncia: [this.denunciaId || 0, Validators.required],
      codigoTramite: ['', Validators.required],
      hora: [horaActual],
      fecha: [fechaActual],
      instalacionAudiencia: ['', Validators.required],
      articulo:['', Validators.required],
      afectadoManifiesta: ['', Validators.required],
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
      testimonio: [''],
      parte: [''],
      archivos: [null], // Control para archivos
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
   // Getter para la tabla de pruebas (actualizada para mostrar archivos solo de abogados)
  get pruebasTabla() {
    if (!this.participantesArray) {
      return [];
    }
    try {
      const participantesRaw = this.participantesArray.getRawValue();
      console.log('Participantes para pruebasTabla:', participantesRaw);

      return participantesRaw
        .map((p: any, index: number) => {
          // Solo incluir participantes que tengan pruebas
          if (!p || !p.pruebas || p.pruebas.trim() === '') {
            return null;
          }

          const esAbogado = p.tipoParticipante === 'Abogado';

          // Usar el método getParticipanteArchivo para obtener el archivo correctamente
          const participanteIndex = this.participantesArray.controls.findIndex(ctrl =>
            ctrl.get('nombres')?.value === p.nombres &&
            ctrl.get('apellidos')?.value === p.apellidos &&
            ctrl.get('cedula')?.value === p.cedula
          );

          let archivoInfo: any = { texto: 'N/A', descargable: false };

          if (esAbogado) {
            if (this.editMode && p.archivos) {
              // En modo edición, mostrar archivo descargable
              archivoInfo = {
                texto: ' Descargar',
                descargable: true,
                nombreArchivo: p.ruta?.split('/').pop() || p.ruta,
                codigoTramite: this.audienciaPruebaForm.get('codigoTramite')?.value || ''
              };
              console.log(`Archivo para abogado ${p.nombres} ${p.apellidos}:`, archivoInfo);
            } else if (!this.editMode) {
              // En modo creación, mostrar estado del archivo
              const archivoFile = this.getParticipanteArchivo(participanteIndex);
              archivoInfo = {
                texto: archivoFile ? '1 archivo' : 'Sin archivo',
                descargable: false
              };
            } else {
              archivoInfo = { texto: 'Sin archivo', descargable: false };
            }
          }

          return {
            index: participanteIndex,
            nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
            pruebas: p.pruebas || '',
            parte: p.parte || '',
            archivos: archivoInfo
          };
        })
        .filter(item => item !== null); // Remover elementos null
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

  // Cancelar edición vulneraciones
  cancelarEdicionVulneraciones(): void {
    this.modoEdicionVulneraciones = false;
    this.vulneracionesIdentificadasForm.reset();
  }

  // Cancelar edición medidas
  cancelarEdicionMedidas(): void {
    this.editMedidasMode = false;
    this.medidasDefinitivasForm.reset();
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
            archivos: [null], // Control para archivos
            idDenuncia: [p.idDenuncia || this.denunciaId]
          }));
        });
      }
      // Si quieres seguir guardando en this.participantes para otros usos:
      this.participantes = data;
    });
  }
  cargarDatosAudiencia(id: number) {
    console.log('Cargando datos de audiencia para ID:', this.denunciaId)
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
        idDenuncia: this.denunciaId || 0,
        instalacionAudiencia: this.datosAudienciaPrueba.articulo,
        // ...otros campos si es necesario
      });


    });
  }
  audienciaPruebasEditMode(idDenuncia: number){

    this.audienciaPruebasService.getAudienciaPruebaEditMode(idDenuncia).subscribe(data => {
      console.log('Datos de audiencia para editar cargados', data);
      if (!data) return;

      this.existeResolucion = data?.idResolucion ?? null;
       // Actualizar estados después de cargar resolución

      // Mostrar toast si existe resolución
      if(this.existeResolucion){
        this.actionsConfig[0].disabled = true
        this.audienciaPruebaForm.disable();

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
        articulo: data?.articulo ?? '',
        afectadoManifiesta: data?.afectadoManifiesta ?? '',
        idDenuncia: this.denunciaId || 0
      }, { emitEvent: false });


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
            archivos: [p.pathPruebas ?? null], // Control para archivos
            ruta: [p.ruta ?? ''], // Control
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
              archivos: [t.pathPruebas ?? null], // Control para archivos
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
   habilitarEdicion(){
    this.isEditAudienciaPruebasActivate=true;
    this.audienciaPruebaForm.enable();
    this.participantesForm.enable();
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;

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
          this.submitAudienciaPrueba();

        }

        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
   cambiarTab(tab: number) {
    this.currentTab = tab;
  }
 cancelar(): void {
    this.router.navigate(['/nna/fases/'+ this.datosAudienciaPrueba?.id]);
  }
   //--editar
      updateAudiencia() {
      // Activar loader
      this.loading = true;
      this.loadingMessage = 'Actualizando audiencia...';

      const formValue = this.audienciaPruebaForm.value;

    // Siempre usar FormData y el método con archivos
    const formData = new FormData();

    // Enviar todos los datos como JSON en el campo 'data' (como espera el backend)
    formData.append('data', JSON.stringify(formValue));

    // Agregar archivos usando el método establecido (si los hay)
    this.agregarArchivosAlFormData(formData);
      this.audienciaPruebasService.actualizarAudienciaPrueba(this.idAudienciaP, formData,this.audienciaPruebaForm.value.codigoTramite,'pruebas').subscribe({
        next: () => {
          this.loading = false; // Desactivar loader
          toast.success('Audiencia Actualizada con Éxito', {
            duration: 3000,
          });
          this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditAudienciaPruebasActivate=false;
    this.audienciaPruebaForm.disable();
    this.participantesForm.disable();
    this.audienciaPruebasEditMode(this.idAudienciaP); // Recargar


        },
        error: (err) => {
          this.loading = false; // Desactivar loader
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

    // Activar loader
    this.loading = true;
    this.loadingMessage = 'Guardando audiencia...';

    const formValue = this.audienciaPruebaForm.value;

    // Siempre usar FormData y el método con archivos
    const formData = new FormData();

    // Enviar todos los datos como JSON en el campo 'data' (como espera el backend)
    formData.append('data', JSON.stringify(formValue));

    // Agregar archivos usando el método establecido (si los hay)
    this.agregarArchivosAlFormData(formData);

    // Usar siempre el método del servicio que maneja archivos
    this.audienciaPruebasService.postAudienciaPruebasConArchivos(formData,this.audienciaPruebaForm.value.codigoTramite,'pruebas').subscribe({
      next: (response) => {
        this.loading = false;
        this.idAudienciaP = response.id;
        toast.success('Audiencia Guardada con Éxito', {
          duration: 3000,
        });
        this.router.navigate(['../../editar/'+ this.denunciaId], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading = false;
        toast.error('Error al guardar', {
          duration: 3000,
          description: `${err}`
        });
      }
    });
  }
//------------SUBMIT PARTICIPANTES---///
  onSubmitParticipante(): void {
    if (this.isActivateModoEdicionParticipante && this.indexParticipanteEditando !== null) {
      this.actualizarParticipante();
    } else {
      if (this.participantesForm.invalid) {
        this.participantesForm.markAllAsTouched();
        toast.error('Formulario inválido', {
          duration: 3000,
          description: 'Por favor, completa todos los campos requeridos'
        });
        return;
      }
      this.loadingBtnParticipante = true;
      this.loadingBtnParticipanteMsg = 'Agregando participante...';
      const body = {
        ...this.participantesForm.value,
      };
      this.audienciaPruebasService.postCrearParticipante(body)
        .pipe(finalize(() => {
          this.loadingBtnParticipante = false;
          this.loadingBtnParticipanteMsg = '';
        }))
        .subscribe({
          next: () => {
            this.participantesArray.push(this.fb.group({ ...this.participantesForm.value }));
            this.participantes = this.participantesArray.getRawValue();
            this.participantesForm.reset();
            this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
            toast.success('Participante agregado correctamente', { duration: 2000 });
          },
          error: (err) => {
            toast.error('Error al agregar participante', { duration: 3000, description: err });
          }
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
        toast.error('Error: Participante no encontrado');
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
        toast.error('Error: No se pudo encontrar el participante');
        console.error('No se pudo encontrar el participante en el array:', participanteData);
        return;
      }
    }

    // Verificar que el FormArray esté sincronizado
    if (!this.participantesArray || index >= this.participantesArray.length) {
      toast.error('Error: Datos no sincronizados');
      console.error('FormArray no sincronizado. Index:', index, 'Array length:', this.participantesArray?.length);
      return;
    }

    const participanteControl = this.participantesArray.at(index);
    if (!participanteControl) {
      toast.error('Error: Control de participante no encontrado');
      console.error('Control de participante no encontrado en índice:', index);
      return;
    }

    const participante = participanteControl.value;
    this.participantesForm.patchValue(participante);
    this.isActivateModoEdicionParticipante = true;
    this.indexParticipanteEditando = index;

    toast.info('Modo edición activado', {
      duration: 2000,
      description: `Editando: ${participante.nombres} ${participante.apellidos}`
    });
  }

  // Actualizar participante
  actualizarParticipante(): void {
    if (this.participantesForm.invalid) {
      this.participantesForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        duration: 3000,
        description: 'Por favor, completa todos los campos requeridos'
      });
      return;
    }

    if (this.indexParticipanteEditando === null || this.indexParticipanteEditando < 0) {
      toast.error('Error: No hay participante en edición');
      return;
    }

    this.loadingBtnParticipante = true;
    this.loadingBtnParticipanteMsg = 'Actualizando participante...';
    try {
      const participanteActualizado = this.participantesForm.value;
      setTimeout(() => {
        this.participantesArray.at(this.indexParticipanteEditando!).patchValue(participanteActualizado);
        this.participantes = this.participantesArray.getRawValue();

        const nombreCompleto = `${participanteActualizado.nombres || ''} ${participanteActualizado.apellidos || ''}`.trim();

        this.cancelarEdicionParticipante();

        toast.success('Participante actualizado correctamente', {
          duration: 3000,
          description: `Los cambios de ${nombreCompleto} han sido guardados`
        });
        this.loadingBtnParticipante = false;
        this.loadingBtnParticipanteMsg = '';
      }, 800); // Simula un pequeño delay visual
    } catch (error) {
      this.loadingBtnParticipante = false;
      this.loadingBtnParticipanteMsg = '';
      console.error('Error al actualizar participante:', error);
      toast.error('Error al actualizar el participante', {
        duration: 3000,
        description: 'Por favor, intenta nuevamente'
      });
    }
  }

  // Cancelar edición participante
  cancelarEdicionParticipante(): void {
    this.loadingBtnParticipante = true;
    this.loadingBtnParticipanteMsg = 'Cancelando...';
    setTimeout(() => {
      this.isActivateModoEdicionParticipante = false;
      this.indexParticipanteEditando = null;
      this.participantesForm.reset();
      this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);
      this.loadingBtnParticipante = false;
      this.loadingBtnParticipanteMsg = '';
      toast.info('Edición cancelada', {
        duration: 2000
      });
    }, 600);
  }

  // Eliminar participante
  eliminarParticipante(indexOrData: number | any): void {
    let index: number;
    let participanteData: any;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      index = indexOrData;
      const participantesData = this.participantesTabla;
      if (!participantesData || index < 0 || index >= participantesData.length) {
        toast.error('Error: Participante no encontrado');
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
        toast.error('Error: No se pudo encontrar el participante a eliminar');
        console.error('No se pudo encontrar el participante a eliminar:', participanteData);
        return;
      }
    }

    // Verificar que el índice sea válido
    if (index < 0 || index >= this.participantesArray.length) {
      toast.error('Error: Índice inválido');
      console.error('Índice inválido para eliminar participante:', index);
      return;
    }

    // Confirmar eliminación
    const nombreCompleto = `${participanteData.nombres || ''} ${participanteData.apellidos || ''}`.trim();
    if (!confirm(`¿Está seguro de eliminar a ${nombreCompleto}?`)) {
      return;
    }

    // Si estamos editando el participante que se eliminó, cancelar edición
    if (this.indexParticipanteEditando === index) {
      this.cancelarEdicionParticipante();
    } else if (this.indexParticipanteEditando !== null && this.indexParticipanteEditando > index) {
      this.indexParticipanteEditando--;
    }

    // Eliminar del FormArray
    this.participantesArray.removeAt(index);
    this.participantes = this.participantesArray.getRawValue();

    toast.success('Participante eliminado correctamente', {
      duration: 3000,
      description: `${nombreCompleto} ha sido eliminado`
    });
  }
  //-----------PDF------------------//
  generarPdf(){
    this.pdfLoading = true;
    this.pdfError = false;
    this.actionsConfig[2].disabled = true;

    this.audienciaPruebasService.crearpdfBlob(this.idAudienciaP).subscribe({
      next: (res: Blob) => {
        const url = URL.createObjectURL(res);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.pdfLoading = false;
        this.actionsConfig[2].disabled = false;
        this.cambiarTab(5);
      },
      error: (err: any) => {
        console.error('Error al generar PDF:', err);
        this.pdfLoading = false;
        this.pdfError = true;
        this.actionsConfig[2].disabled = false;
        toast.error('Error al generar PDF', {
          duration: 4000,
          description: 'No se pudo generar el PDF. Intenta nuevamente.'
        });
      }
    });
  }

  retryGenerarPdf(): void {
    this.generarPdf();
  }

  // Método para descargar archivo de prueba
  descargarArchivoPrueba(codigoTramite: string, nombreArchivo: string): void {
    if (!codigoTramite || !nombreArchivo) {
      toast.error('Información de archivo incompleta', { duration: 3000 });
      return;
    }

    console.log('Descargando archivo:', { codigoTramite, nombreArchivo });

    this.audienciaPruebasService.descargarArchivoSeguro(codigoTramite, nombreArchivo)
      .subscribe({
        next: (blob: Blob) => {
          // Crear URL del blob y descargar
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = nombreArchivo;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast.success('Archivo descargado exitosamente', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error al descargar archivo:', error);
          toast.error('Error al descargar el archivo', {
            duration: 4000,
            description: 'Verifique que el archivo existe en el servidor'
          });
        }
      });
  }

  // Método para manejar selección de archivos (patrón anexar_seguimiento)
  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const participanteIndex = this.pruebasForm.get('participanteIndex')?.value;

    console.log('Archivo seleccionado - Índice participante:', participanteIndex);
    console.log('Total participantes:', this.participantesArray.length);

    if (participanteIndex === null || participanteIndex === '' || participanteIndex < 0 || participanteIndex >= this.participantesArray.length) {
      toast.error('Selecciona un abogado primero', { duration: 3000 });
      return;
    }

    const participanteCtrl = this.participantesArray.at(participanteIndex);
    const tipoParticipante = participanteCtrl?.get('tipoParticipante')?.value;

    console.log('Tipo de participante:', tipoParticipante);

    // Solo permitir archivos para abogados
    if (tipoParticipante !== 'Abogado') {
      toast.error('Solo los abogados pueden subir archivos', { duration: 3000 });
      event.target.value = '';
      return;
    }

    if (files.length > 0) {
      // Solo tomar el primer archivo (un archivo por abogado)
      const archivo = files[0];
      participanteCtrl.get('archivos')?.setValue(archivo);
      console.log(`Archivo seleccionado para abogado ${participanteIndex}:`, archivo.name);
      console.log('Archivo guardado en control:', participanteCtrl.get('archivos')?.value);

      // Forzar detección de cambios
      this.participantesArray.updateValueAndValidity();

      // Mostrar confirmación
      toast.success(`Archivo "${archivo.name}" seleccionado`, { duration: 3000 });
    }

    // Limpiar input para permitir seleccionar el mismo archivo de nuevo si es necesario
    event.target.value = '';
  }

  // Método para remover archivo
  removeFile(participanteIndex: number): void {
    if (participanteIndex < 0 || participanteIndex >= this.participantesArray.length) return;

    const participanteCtrl = this.participantesArray.at(participanteIndex);
    const archivo = participanteCtrl?.get('archivos')?.value;

    if (archivo) {
      participanteCtrl?.get('archivos')?.setValue(null);

      // Forzar detección de cambios
      this.participantesArray.updateValueAndValidity();

      toast.success('Archivo eliminado', { duration: 2000 });
      console.log(`Archivo eliminado del participante ${participanteIndex}`);
    }
  }

  // Método para obtener archivo de un participante
  getParticipanteArchivo(participanteIndex: number): File | null {
    if (participanteIndex < 0 || participanteIndex >= this.participantesArray.length) {
      console.log('Índice inválido para getParticipanteArchivo:', participanteIndex, 'Total:', this.participantesArray.length);
      return null;
    }

    const participanteCtrl = this.participantesArray.at(participanteIndex);
    const tipoParticipante = participanteCtrl?.get('tipoParticipante')?.value;
    const archivo = participanteCtrl?.get('archivos')?.value;

    console.log(`getParticipanteArchivo - Índice: ${participanteIndex}, Tipo: ${tipoParticipante}`);
    console.log('Control archivos value:', archivo);
    console.log('¿Es File?:', archivo instanceof File);

    // Solo mostrar archivos si es abogado
    if (tipoParticipante === 'Abogado') {
      console.log('Archivo encontrado:', archivo?.name || 'null');
      return archivo instanceof File ? archivo : null;
    }

    console.log('No es abogado, retornando null');
    return null;
  }

  // Método para agregar archivos al FormData (formato específico para backend)
  private agregarArchivosAlFormData(formData: FormData): void {
    this.participantesArray.controls.forEach((participante, index) => {
      const archivo = participante.get('archivos')?.value;
      const tipoParticipante = participante.get('tipoParticipante')?.value;

      // Solo procesar archivos de abogados
      if (tipoParticipante === 'Abogado' && archivo instanceof File) {
        // Usar el formato específico que espera el backend: archivo_abogado_INDEX
        formData.append(`archivo_abogado_${index}`, archivo);
        console.log(`Archivo agregado para abogado ${index}:`, archivo.name);
      }
    });
  }

}
export default Crear_audiencia_pruebaComponent;
