import { Component, OnInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { AvocatoriaService } from '../../services/avocatoria.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { QuillModule } from 'ngx-quill';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticuloMedidas, MedidasService } from '@nna/services/medidas.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-crearAvocatoria',
  templateUrl: './crearAvocatoria.component.html',
  imports: [CommonModule,
     ReactiveFormsModule,
      QuillModule,
      CardFormComponent,
      ButtonSubmitComponent,
      TablaEditComponent],
})
export class CrearAvocatoriaComponent implements OnInit {
  @ViewChild('formContainer', { static: false }) formContainerRef?: ElementRef<HTMLElement>;
  //variables formulario//----------
    avocatoriaForm!: FormGroup;
    existeNotificacion: any = null;
  medidasEmergentesForm!: FormGroup;
  editMode: boolean = false;
  editMediasMode: boolean = false;
   medidasEmergentesArray: any[] = [];
  //------------------------------------
  denunciaAvocatoria: any = null;
  avocatoriacargada: any = null;
  medidasPorArticulo: ArticuloMedidas[] = [];
  afectados: any[] = [{id: 0, nombres: ''}];

  // Guarda las medidas que el usuario eliminó localmente por afectado


  denunciaId: number = 0;
  currentTab = 0;
  fechaHoraActual: Date = new Date();
   pdfSrc: SafeResourceUrl | null = null;

//variables para controlar los botones//
  // Estados internos para los botones (sin la lógica de notificación)
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
    // PDF: Si existe notificación, siempre activo. Si no, respeta el estado manual
    this.pdfDisabled = this.existeNotificacion ? false : this._pdfDisabled;

    // Guardar: Si existe notificación, siempre deshabilitado. Si no, respeta el estado manual
    this.guardarDisabled = this.existeNotificacion ? true : this._guardarDisabled;

    // Editar: Si existe notificación, siempre deshabilitado. Si no, respeta el estado manual
    this.editarDisabled = this.existeNotificacion ? true : this._editarDisabled;
  }
  private ignoreFirstValueChangeAvocatoria = false;
  idAvocatoria!: number;
  //------------------------------------
  //
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

      this.loadDenunciaParaAvocatoria(this.denunciaId)

      this.LoadAfectados(this.denunciaId);


    });


    this.cargarListaDeMedidas();
    this.formularioAvocatoria();
    this.formularioMedidasEmergentes();
    this.seleccionarMedida();



    //----escucha cambios en los formularios para debug----//

    this.avocatoriaForm.valueChanges.subscribe((data) => {
        // In edit mode: ignore the first change caused by patchValue, then
        // when the user modifies the form enable 'Editar' and disable PDF
        if (this.editMode) {
          if (this.ignoreFirstValueChangeAvocatoria) {
            this.ignoreFirstValueChangeAvocatoria = false;
            return;
          }

          // Ignorar cambios mientras estamos cargando datos de edición
          if (this.cargandoDatosEdicion) {
            return;
          }

          // Cuando hay cambios reales del usuario, deshabilitar PDF y habilitar editar
          this._pdfDisabled = true;
          this._editarDisabled = false;
          this.actualizarEstadoBotones();
          return;
        }
        // Creation mode: keep previous behavior (only toggle after saved)
        if (!this.guardarDisabled) return; // Solo si ya se guardó
        this._pdfDisabled = true;
        this._editarDisabled = false;
        this.actualizarEstadoBotones();
    });
    this.medidasEmergentesForm.valueChanges.subscribe((data) => {
      console.log( data);
    });


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



  //-------getters de formulario-----------------//
  get medidas(): FormArray {
  return this.avocatoriaForm.get('mediasEmergentes') as FormArray;
}




  //---------------llenar formulario-----------------//




  //--------------carga de datos---------//

  avocaroriaEditMode(idAvocatoria: number){
    this.cargandoDatosEdicion = true; // Marcar que estamos cargando datos
    this.avocatoriaService.getAvocatoriaEditMode(idAvocatoria).subscribe(data=>{
      this.avocatoriacargada = data;
      this.fechaHoraActual= new Date(this.avocatoriacargada.fechaCreado),
      this.existeNotificacion = this.avocatoriacargada.notificacion;
      this.actualizarEstadoBotones(); // Actualizar estados después de cargar notificación

      // Mostrar toast si existe notificación
      if(this.existeNotificacion){
        this.avocatoriaForm.disable();
        this.medidasEmergentesForm.disable();
        this.actualizarEstadoBotones();
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
          this._pdfDisabled = false;
          this._editarDisabled = true;
          this.actualizarEstadoBotones();
        }
        // Clear the ignore flag on the next tick so the first real user change is handled
        setTimeout(() => { this.ignoreFirstValueChangeAvocatoria = false; }, 0);


      }

      // Marcar que terminó la carga de datos para permitir detectar cambios reales del usuario
      setTimeout(() => {
        this.cargandoDatosEdicion = false;
      }, 100); // Pequeño delay para asegurar que todos los patchValue hayan terminado
    });


  }

  loadDenunciaParaAvocatoria(id: number) {
    this.avocatoriaService.obtenerDenunciaParaAvocatoria(id).subscribe({
      next: (data) => {
        this.denunciaAvocatoria = data;
        this.idAvocatoria=data.idAvocatoria;
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

   medidasEmergentes(event: Event) {
    const target = event.target as HTMLSelectElement;

    const afectadoId = parseInt(target.value, 10);
    if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
    this.resetEditor();

    this.loadMedidasporAfectado(afectadoId);

  }
  /**
   * Obtiene las medidas emergentes por afectado y las almacena en el array
   */
  obtenerMedidasEmergentesPorAfectado(afectadoId: number): void {
    if (!afectadoId) {
      console.warn('No se puede obtener medidas emergentes: ID de afectado no disponible');
      this.medidasEmergentesArray = [];
      return;
    }

    console.log('Actualizando medidas emergentes para afectado:', afectadoId);

    this.medidasService.getMedidasEmergentes(afectadoId).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response)) {
          this.medidasEmergentesArray = response;
          console.log('Medidas emergentes actualizadas:', this.medidasEmergentesArray);
        } else {
          console.warn('Respuesta inesperada del servicio:', response);
          this.medidasEmergentesArray = [];
        }
      },
      error: (error: any) => {
        console.error('Error al obtener medidas emergentes por afectado:', error);
        this.medidasEmergentesArray = [];
      }
    });
  }

  loadMedidasporAfectado(afectadoId: number) {
    if (!afectadoId) return;

    // PRIMERO: Verificar si ya existen medidas emergentes para este afectado
    this.medidasService.getMedidasEmergentes(afectadoId).subscribe({
      next: (responseMedidasEmergentes: any) => {
        const medidasEmergentesExistentes = Array.isArray(responseMedidasEmergentes) ? responseMedidasEmergentes : [];

        if (medidasEmergentesExistentes.length > 0) {
          // Si ya existen medidas emergentes, solo cargarlas y mostrarlas
          console.log('Ya existen medidas emergentes para este afectado, cargando existentes...');
          this.medidasEmergentesArray = medidasEmergentesExistentes;
          console.log('Medidas emergentes existentes cargadas:', this.medidasEmergentesArray);
        } else {
          // Si NO existen medidas emergentes, entonces cargar y agregar las medidas identificadas
          console.log('No existen medidas emergentes, procediendo a cargar medidas identificadas...');
          this.cargarYAgregarMedidasIdentificadas(afectadoId);
        }
      },
      error: (error: any) => {
        console.error('Error al verificar medidas emergentes existentes:', error);
        // En caso de error, intentar cargar medidas identificadas como fallback
        this.cargarYAgregarMedidasIdentificadas(afectadoId);
      }
    });
  }

  private cargarYAgregarMedidasIdentificadas(afectadoId: number) {
    // Consumir API de medidas identificadas
    this.medidasService.getMedidasidentificadas(afectadoId).subscribe({
      next: (response: any) => {
        console.log('Medidas identificadas obtenidas:', response);

        // Obtener la lista de medidas del afectado
        const medidasIdentificadas = Array.isArray(response?.afectado) ? response.afectado : [];

        if (medidasIdentificadas.length > 0) {
          // Agregar cada medida una por una como medida emergente
          this.agregarMedidasEmergentesIndividualmente(medidasIdentificadas, afectadoId);
        } else {
          console.log('No se encontraron medidas identificadas para este afectado');
          // Asegurar que el array esté vacío si no hay medidas
          this.medidasEmergentesArray = [];
        }
      },
      error: (error: any) => {
        console.error('Error al cargar medidas identificadas:', error);
        this.medidasEmergentesArray = [];
      }
    });
  }

  private agregarMedidasEmergentesIndividualmente(medidas: any[], afectadoId: number) {
    if (medidas.length === 0) {
      console.log('No hay medidas identificadas para procesar');
      this.medidasEmergentesArray = [];
      return;
    }

    console.log(`Procesando ${medidas.length} medidas identificadas para agregar como medidas emergentes`);

    // Crear array de observables para todas las operaciones
    const requests: Observable<any>[] = medidas.map((medida, index) => {
      const medidaEmergente = {
        idAfectado: afectadoId,
        idMedida: medida.idMedida || medida.id || null,
        medida: medida.medida || medida.descripcion || '',
        periodo: medida.periodo || '', // Se puede dejar vacío para que el usuario lo complete
        observaciones: medida.observaciones || 'Medida agregada automáticamente desde medidas identificadas'
      };

      // Retornar observable con manejo de errores individual
      return this.medidasService.agregarMedidasEmergentes(medidaEmergente).pipe(
        catchError((error) => {
          console.error(`Error al agregar medida emergente ${index + 1}:`, error);
          // Retornar un observable con error controlado para que forkJoin no se detenga
          return of({ error: true, medida: medidaEmergente, errorDetails: error });
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
          console.log('Actualizando lista de medidas emergentes...');
          // Ahora SÍ actualizar la lista porque sabemos que las operaciones terminaron
          this.obtenerMedidasEmergentesPorAfectado(afectadoId);
        } else {
          console.warn('Ninguna medida fue agregada exitosamente');
          this.medidasEmergentesArray = [];
        }
      },
      error: (error) => {
        console.error('Error crítico en el procesamiento de medidas:', error);
        // En caso de error crítico, intentar cargar las medidas existentes
        this.obtenerMedidasEmergentesPorAfectado(afectadoId);
      }
    });
  }


agregarMedida(fg: FormGroup){

  const body = { ...fg.value };
  this.medidasService.agregarMedidasEmergentes(body).subscribe({
    next: () => {

      this.obtenerMedidasEmergentesPorAfectado(this.medidasEmergentesForm.get('idAfectado')?.value);
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

resetEditor() {
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
    if (!this.medidas) return;

    this.medidasService.eliminarMedidasEmergentes(registro.id).subscribe({
      next: () => {
        toast.success('Medida eliminada con éxito', {
          duration: 3000,
        });
        this.obtenerMedidasEmergentesPorAfectado(this.medidasEmergentesForm.get('idAfectado')?.value);
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

  SeleccionarParaEditar(registro: any): void {

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
        this.resetEditor();
        this.editMediasMode = false;


        this.obtenerMedidasEmergentesPorAfectado(this.medidasEmergentesForm.get('idAfectado')?.value);
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
    this.router.navigate(['/nna/fases/'+ this.denunciaAvocatoria?.id]);
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
        this._pdfDisabled = false;
        this._editarDisabled = true;
        this.actualizarEstadoBotones();

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
  const body ={
    ...this.avocatoriaForm.value,

  }

  this.avocatoriaService.postAvocatoria(body).subscribe({
    next: (body) => {
      this.idAvocatoria = body.id;
      console.log('ID de avocatoria guardada:', body)
      toast.success('avocatoria Guardada con Éxito', {
                duration: 3000,
              });
              this.editMode = true
      this._pdfDisabled = false;
        this._guardarDisabled = true;
        this.actualizarEstadoBotones();
        this.router.navigate(['/nna/avocatoria/editar/'+ this.denunciaAvocatoria?.id]);

    },
    error(err) {

      toast.error('Error al guardar', {
        duration: 3000,
      description:`${err}`
      });

  }})

}
generarPdf(){

    this.avocatoriaService.crearpdfBlob(this.idAvocatoria).subscribe((res: Blob) => {
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab(3);
  }
}
export default CrearAvocatoriaComponent
