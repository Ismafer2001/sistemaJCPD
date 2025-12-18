import { Component, OnDestroy, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { AvocatoriaService } from '../../services/avocatoria.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticuloMedidas, MedidasService } from '@nna/services/medidas.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';

@Component({
  selector: 'app-crearAvocatoria',
  templateUrl: './crearAvocatoria.component.html',
  imports: [CommonModule,
     ReactiveFormsModule,
      QuillModule,
      CardFormComponent,
      ButtonSubmitComponent,
      TablaEditComponent,
    NavFormularioComponent,
  RouterLink],
})
export class CrearAvocatoriaComponent implements OnInit, OnDestroy {
  @ViewChild('formContainer', { static: false }) formContainerRef?: ElementRef<HTMLElement>;
  private destroy$ = new Subject<void>();
  //variables formulario//----------
    avocatoriaForm!: FormGroup;
    existeNotificacion: any = null;

  medidasEmergentesForm!: FormGroup;
  editMode: boolean = false;
  editMediasMode: boolean = false;
  isBotonDesactivated: boolean = false;
   medidasEmergentesArray: any[] = [];
  //------------------------------------
  denunciaAvocatoria: any = null;
  avocatoriacargada: any = null;
  medidasPorArticulo: ArticuloMedidas[] = [];
  afectados: any[] = [{id: 0, nombres: ''}];

  denunciaId: number = 0;
  //--- Configuración de tabs------//
  tabsConfig: any[] = [
    {
      id: 0,
      label: 'Detalles'
    },
    {
      id: 1,
      label: 'Resoluciones'
    },
    {
      id: 2,
      label: 'Medidas'
    },
    {
      id: 3,
      label: 'pdf'
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
  grupo: string = '';
  fechaHoraActual: Date = new Date();
  pdfSrc: SafeResourceUrl | null = null;

  private cargandoDatosEdicion = false; // Flag para ignorar cambios durante carga

  idAvocatoria!: number;
  isEditAvocatoriaActivate:boolean=false;

//quillModule//
  modules = {
  toolbar: [
    // Estilo de texto
    ['bold', 'italic', 'underline', 'strike'],         // Negrita, cursiva, subrayado, tachado
    ['blockquote', 'code-block'],                      // Cita y bloque de código
    // Listas y sangrías
    [{ list: 'ordered' }, { list: 'bullet' }],         // Lista ordenada y con viñetas
    [{ indent: '-1' }, { indent: '+1' }],              // Sangría

    // Alineación
    [{ align: [] }],                                   // Izquierda, centro, derecha, justificado

    // Limpieza
    ['clean'],                                         // Quitar formato

    // Multimedia
    ['link', 'image']                         // Insertar enlaces, imágenes y videos
  ]
};

  constructor(private avocatoriaService: AvocatoriaService,
     private route: ActivatedRoute,
      private medidasService: MedidasService,
       private fb:FormBuilder,
      private router: Router,
    private sanitizer: DomSanitizer )
  {

  }

  ngOnInit() {
    this.formularioAvocatoria();
    this.formularioMedidasEmergentes();
    const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;
        this.avocatoriaForm.disable()
        this.medidasEmergentesForm.disable()
        this.isBotonDesactivated=true;


        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
         this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      }

      this.loadDenunciaParaAvocatoria(this.denunciaId)

      this.LoadAfectados(this.denunciaId);


    });


    this.cargarListaDeMedidas();

    this.seleccionarMedida();



    //----escucha cambios en los formularios para debug----//

    this.avocatoriaForm.valueChanges.subscribe((data) => {
        // In edit mode: ignore the first change caused by patchValue, then
        // when the user modifies the form enable 'Editar' and disable PDF
        if (this.editMode) {


          // Ignorar cambios mientras estamos cargando datos de edición
          if (this.cargandoDatosEdicion) {
            return;
          }



          return;
        }



    });
    this.medidasEmergentesForm.valueChanges.subscribe((data) => {
      console.log( data);
    });


  }
   ngOnDestroy() {
    console.log('✅ Limpiando todas las suscripciones');
    this.destroy$.next();
    this.destroy$.complete();
  }

  //--------CREAcion de FORMULARIO DE AVOCATORIA-----------------//

  formularioAvocatoria() {
    this.avocatoriaForm=this.fb.group({
      codigoTramite: ['', Validators.required],
      idDenuncia: ['', Validators.required],
       fechaActual: [this.fechaHoraActual.toISOString().split('T')[0],
        Validators.required

      ],
       horaActual: [this.fechaHoraActual.toTimeString().split(':').slice(0, 2).join(':'),
        Validators.required

      ],

       dispocisiones: [`<p> PRIMERO.-. Se le hace conocer a…………………………………………………….
lo que estipula
Art            del  Código de la Niñez y Adolescencia
Art            de la Ley de personas adultas mayores
Art            de la Ley de prevención y erradicación de la violencia
…………………………………………………………….……………………………………………………………………………………………………………………………………………………………………….
 SEGUNDO.- Se le hace conocer a ……………………………………….. lo que estipula
Art            del  Código de la Niñez y Adolescencia
Art            de la Ley de personas adultas mayores
Art            de la Ley de prevención y erradicación de la violencia

TERCERO.-
CUARTO.-<p>`,
        Validators.required

      ],
      articulo: ['', Validators.required],


    })

  }
  formularioMedidasEmergentes() {
   this.medidasEmergentesForm= this.fb.group({
      idAfectado: ['', Validators.required],
      idMedida: ['', Validators.required],
      medida: ['', Validators.required],
      periodo: ['', Validators.required],
      observaciones: ['', Validators.required],
      id: ['', Validators.required]

    });
  }


  //--------------carga de datos---------//

  avocaroriaEditMode(idAvocatoria: number){
    this.cargandoDatosEdicion = true; // Marcar que estamos cargando datos
    this.avocatoriaService.getAvocatoriaEditMode(idAvocatoria).subscribe(data=>{
      this.avocatoriacargada = data;
      this.fechaHoraActual= new Date(this.avocatoriacargada.fechaCreado),
      this.existeNotificacion = this.avocatoriacargada.notificacion;
       // Actualizar estados después de cargar notificación

      // Mostrar toast si existe notificación
      if(this.existeNotificacion){
        this.actionsConfig[0].disabled = true
        this.avocatoriaForm.disable();
        this.medidasEmergentesForm.disable();

        toast.warning('No puedes editar esta avocatoria', {
          duration: 10000,
          description: 'Ya existe una notificación asociada a esta avocatoria',
        });
      }

      console.log('avocatoria cargada', this.avocatoriacargada);

      // Patch values into the avocatoriaForm (use fallbacks for different backend keys)
      if (this.avocatoriacargada) {
         // Prepare fecha/hora from possible ISO timestamp 'fechaCreado'
        let fechaToUse = this.avocatoriaForm.get('fechaActual')?.value;
        let horaToUse = this.avocatoriaForm.get('horaActual')?.value;
        const fc = this.avocatoriacargada.fechaCreado ?? this.avocatoriacargada.fecha_creado ?? this.avocatoriacargada.createdAt ?? this.avocatoriacargada.fecha;
        if (fc) {
          try {
            const d = new Date(fc);
            if (!isNaN(d.getTime())) {
              // Format date YYYY-MM-DD and time HH:MM using local time
              const pad = (n: number) => String(n).padStart(2, '0');
              fechaToUse = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
              horaToUse = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
          } catch (e) {
            // ignore parse errors and fall back to existing fields
          }
        }
        this.avocatoriaForm.patchValue({
          codigoTramite: this.avocatoriacargada.codigoTramite ?? '',

          fechaActual: fechaToUse ?? this.avocatoriacargada.fechaActual ?? this.avocatoriacargada.fecha_actual ?? this.avocatoriacargada.fecha ?? this.avocatoriaForm.get('fechaActual')?.value,
          horaActual: horaToUse ?? this.avocatoriacargada.horaActual ?? this.avocatoriacargada.hora_actual ?? this.avocatoriacargada.hora ?? this.avocatoriaForm.get('horaActual')?.value,
          dispocisiones: this.avocatoriacargada.dispocisiones ?? this.avocatoriacargada.disposiciones ?? this.avocatoriacargada.disposicion ?? this.avocatoriacargada.dispocisiones ?? this.avocatoriaForm.get('dispocisiones')?.value,
          articulo: this.avocatoriacargada.articulo ?? this.avocatoriacargada.articulo ?? this.avocatoriaForm.get('articulo')?.value,
         }, { emitEvent: false });
        // Ensure initial button state for edit mode: PDF enabled, Edit disabled
        if (this.editMode) {


        }



      }

      // Marcar que terminó la carga de datos para permitir detectar cambios reales del usuario
      setTimeout(() => {
        this.cargandoDatosEdicion = false;
      }, 100); // Pequeño delay para asegurar que todos los patchValue hayan terminado
    });


  }

  loadDenunciaParaAvocatoria(id: number) {
    console.log('Cargando denuncia para avocatoria con ID:', id);
    this.avocatoriaService.obtenerDenunciaParaAvocatoria(id).subscribe({
      next: (data) => {
        this.denunciaAvocatoria = data;
        this.idAvocatoria=data.idAvocatoria;
        console.log('Denuncia para avocatoria cargada:', this.idAvocatoria);
        if(this.editMode){
          this.avocaroriaEditMode(this.idAvocatoria);

        }

        this.avocatoriaForm.patchValue({
          codigoTramite: this.denunciaAvocatoria.codigoTramite,
          idDenuncia: this.denunciaAvocatoria.id,

        });


      },
      error: (err) => {
        console.error('Error al cargar la denuncia para avocatoria', err);
      }
    });
  }

  //-------LOGICA DE MEDIDAS EMERGENTES EN AVOCATORIA-----------------//

  //cargar afectado para selccionar en el formulario de medidas emergentes
  LoadAfectados(id: number) {
    this.avocatoriaService.getAfectados(id).subscribe({
      next: (data) => {
        this.afectados = data;
      },
      error: (err) => {
        console.error('Error al cargar los afectados', err);
      }
    });
  }
//rellenar el formulario al seleccionar una medida
  seleccionarMedida() {
  this.medidasEmergentesForm.get('idMedida')!
    .valueChanges
    .subscribe((id: number | string) => {
      const numId = Number(id);
      // Busca el nombre en tu catálogo
      const encontrado = this.medidasPorArticulo
        .flatMap(a => a.medidas)
        .find(m => m.id === numId);

      this.medidasEmergentesForm.patchValue(
        { medida: encontrado?.medida ?? '' },
        { emitEvent: false }
      );
    });

}
//cargar listado de la medidas de poroteccion por articulo
  cargarListaDeMedidas() {

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

   onAfectadoSeleccionado(event: Event) {
    const target = event.target as HTMLSelectElement;

    const afectadoId = parseInt(target.value, 10);
    if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
    this.resetEditorMedida();

    this.consolidateMedidasLoading(afectadoId);

  }

  /**
   * Método consolidado para manejar la carga de medidas emergentes
   * Verifica si existen medidas emergentes, si no las hay, carga e integra las medidas identificadas
   */
  private consolidateMedidasLoading(afectadoId: number): void {
    if (!afectadoId) {
      console.warn('No se puede cargar medidas: ID de afectado no disponible');
      this.medidasEmergentesArray = [];
      return;
    }

    console.log('Cargando medidas para afectado:', afectadoId);

    // Verificar primero si ya existen medidas emergentes
    this.medidasService.getMedidasEmergentes(afectadoId).subscribe({
      next: (responseMedidasEmergentes: any) => {
        const medidasEmergentesExistentes = Array.isArray(responseMedidasEmergentes.afectado)
          ? responseMedidasEmergentes.afectado
          : [];

        if (medidasEmergentesExistentes.length > 0) {
          // Si ya existen medidas emergentes, cargarlas directamente
          console.log('Medidas emergentes existentes encontradas:', medidasEmergentesExistentes.length);
          this.medidasEmergentesArray = medidasEmergentesExistentes;
        } else {
          // Si no existen, procesar medidas identificadas
          console.log('No hay medidas emergentes, procesando medidas identificadas...');
          this.procesarMedidasIdentificadas(afectadoId);
        }
      },
      error: (error: any) => {
        console.error('Error al verificar medidas emergentes:', error);
        // Como fallback, intentar procesar medidas identificadas
        this.procesarMedidasIdentificadas(afectadoId);
      }
    });
  }

  /**
   * Procesa las medidas identificadas y las convierte en medidas emergentes
   */
  private procesarMedidasIdentificadas(afectadoId: number): void {
    this.medidasService.getMedidasidentificadas(afectadoId).subscribe({
      next: (response: any) => {
        const medidasIdentificadas = Array.isArray(response?.afectado) ? response.afectado : [];

        if (medidasIdentificadas.length > 0) {
          console.log(`Procesando ${medidasIdentificadas.length} medidas identificadas`);
          this.convertirMedidasIdentificadasAEmergentes(medidasIdentificadas, afectadoId);
        } else {
          console.log('No se encontraron medidas identificadas');
          this.medidasEmergentesArray = [];
        }
      },
      error: (error: any) => {
        console.error('Error al cargar medidas identificadas:', error);
        this.medidasEmergentesArray = [];
      }
    });
  }

  /**
   * Convierte medidas identificadas en medidas emergentes usando forkJoin
   */
  private convertirMedidasIdentificadasAEmergentes(medidas: any[], afectadoId: number): void {
    const requests: Observable<any>[] = medidas.map((medida) => {
      const medidaEmergente = {
        idAfectado: afectadoId,
        idMedida: medida.idMedida || medida.id || null,
        medida: medida.medida || medida.descripcion || '',
        periodo: medida.periodo || '',
        observaciones: medida.observaciones || 'Medida agregada automáticamente desde medidas identificadas'
      };

      return this.medidasService.agregarMedidasEmergentes(medidaEmergente).pipe(
        catchError((error) => {
          console.error('Error al agregar medida emergente:', error);
          return of({ error: true, medida: medidaEmergente, errorDetails: error });
        })
      );
    });

    forkJoin(requests).pipe(
      finalize(() => console.log('Procesamiento de medidas emergentes completado'))
    ).subscribe({
      next: (responses) => {
        const exitosos = responses.filter(r => !r.error).length;
        const errores = responses.filter(r => r.error).length;

        console.log(`✅ Resultado: ${exitosos} exitosas, ${errores} con errores`);

        if (exitosos > 0) {
          // Recargar la lista actualizada desde el servidor
          this.recargarMedidasEmergentes(afectadoId);
        } else {
          console.warn('Ninguna medida fue agregada exitosamente');
          this.medidasEmergentesArray = [];
        }
      },
      error: (error) => {
        console.error('Error crítico en procesamiento:', error);
        this.recargarMedidasEmergentes(afectadoId);
      }
    });
  }

  /**
   * Recarga las medidas emergentes desde el servidor
   */
  private recargarMedidasEmergentes(afectadoId: number): void {
    this.medidasService.getMedidasEmergentes(afectadoId).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.afectado)) {
          this.medidasEmergentesArray = response.afectado;
          console.log('Lista de medidas emergentes actualizada:', this.medidasEmergentesArray.length);
        } else {
          console.warn('Respuesta inesperada al recargar:', response);
          this.medidasEmergentesArray = [];
        }
      },
      error: (error: any) => {
        console.error('Error al recargar medidas emergentes:', error);
        this.medidasEmergentesArray = [];
      }
    });
  }

agregarMedida(fg: FormGroup){

  const body = { ...fg.value };
  this.medidasService.agregarMedidasEmergentes(body).subscribe({
    next: () => {

      this.recargarMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value);
      this.resetEditorMedida();
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

resetEditorMedida() {
  const afectado = this.medidasEmergentesForm.get('idAfectado')?.value;
  this.medidasEmergentesForm.reset({
    idAfectado: afectado,
    idMedida: null,
    medida: '',
    periodo: '',
    observaciones: '',
  });

}

  // -----------Eliminar una medida aceptando índice o item (flexible)
  eliminarMedida(registro: any): void {


    this.medidasService.eliminarMedidasEmergentes(registro.id).subscribe({
      next: () => {
        toast.success('Medida eliminada con éxito', {
          duration: 3000,
        });
        this.recargarMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value);
      },
      error: (err) => {
        toast.error('Error al eliminar medida', {
          duration: 3000,
          description: err
        });
      }
    })


  }

  // Editar una medida: carga la fila seleccionada en el formulario para editar

  SeleccionarParaEditarMedida(registro: any): void {

    if (!this.medidasEmergentesArray || this.medidasEmergentesArray.length === 0) return;

    // Cargar los datos del item en el formulario de edición
    this.medidasEmergentesForm.patchValue({
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
    this.scrollFormToTop();

  }

  // Scroll helper: prefer the local scrollable container, fallback to window
  private scrollFormToTop(): void {
    try {
      // if we have a ViewChild reference use it
      if (this.formContainerRef && this.formContainerRef.nativeElement) {
        this.formContainerRef.nativeElement.scrollTo({ top: 90, behavior: 'smooth' });
        return;
      }
      // fallback: try to find a common container by id or class
      const el = document.querySelector('#formContainer') as HTMLElement | null || document.querySelector('.form-container') as HTMLElement | null;
      if (el) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // final fallback: scroll window
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // ignore errors; scrolling is non-critical
      console.warn('scrollFormToTop failed', e);
    }
  }
  actualizarMedida(){
    const fg = this.medidasEmergentesForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
    return;
  }
      this.medidasService.actualizarMedidasEmergentes(this.medidasEmergentesForm.get('id')?.value, this.medidasEmergentesForm.value).subscribe({
      next: () => {
        toast.success('Medida actualizada con éxito', {
          duration: 3000,
        });
        this.resetEditorMedida();
        this.editMediasMode = false;


        this.recargarMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value);
      },
      error: (err) => {
        toast.error('Error al actualizar medida', {
          duration: 3000,
          description: err
        });
      }
    });
  }
//---------Botones de la navegacion ------------------//\

 cambiarTab(tab: number) {
    this.currentTab = tab;
  }
regresar(): void {
    this.router.navigate([`/${this.grupo}/fases/`+ this.denunciaAvocatoria?.id]);
  }

   handleActionButton(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if (this.editMode) {
          this.updateAvocatoria();
        }else{
          this.submitAvocatoria();
        }

        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
  habilitarEdicion(){
    this.isEditAvocatoriaActivate=true;
    this.avocatoriaForm.enable();
    this.medidasEmergentesForm.enable();
    this.isBotonDesactivated=false;
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;
  }
  //--editar
  updateAvocatoria() {
  const body ={
    ...this.avocatoriaForm.value,

  }
  this.avocatoriaService.actualizarAvocatoria(this.idAvocatoria, body).subscribe({
    next: () => {
      toast.success('avocatoria Actualizada con Éxito', {
                duration: 3000,
              });
              this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditAvocatoriaActivate=false;
    this.avocatoriaForm.disable();
    this.medidasEmergentesForm.disable();
    },
    error: (err) => {
      toast.error('Error al actualizar la avocatoria', {
        duration: 3000,
      });
    }

  })

}

//------------submit-----//
submitAvocatoria() {

  if (this.avocatoriaForm.invalid) {
    this.avocatoriaForm.markAllAsTouched();
    toast.error('Formulario inválido', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
  this.actionsConfig[1].disabled = true
  const body ={
    ...this.avocatoriaForm.value,

  }

  this.avocatoriaService.postAvocatoria(body).subscribe({
    next: (body) => {
      this.idAvocatoria = body.id;

       this.router.navigate(['../../editar/'+ this.denunciaId], { relativeTo: this.route });
      toast.success('avocatoria Guardada con Éxito', {
                duration: 3000,
              });

    },
    error(err) {

      toast.error('Error al guardar', {
        duration: 3000,
      description:`${err}`
      });

  }})

}

generarPdf(){
  this.actionsConfig[2].disabled = true
  this.avocatoriaService.crearpdfBlob(this.idAvocatoria).subscribe((res: Blob) => {
    const url = URL.createObjectURL(res);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.actionsConfig[2].disabled = false
  });
  this.cambiarTab(3);
  }
}
export default CrearAvocatoriaComponent
