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
  //------------------------------------
  denunciaAvocatoria: any = null;
  avocatoriacargada: any = null;
  medidasPorArticulo: ArticuloMedidas[] = [];
  afectados: any[] = [{id: 0, nombres: ''}];
  medidasIdenificadas: [] = [];
  // Guarda las medidas que el usuario eliminó localmente por afectado
  removedMedidasByAfectado: Map<number, Set<number>> = new Map();
  selectedIndex: number | null = null;
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


    this.cargarMedidas();
    this.formularioAvocatoria();
    this.formularioMedidasEmergentes();
    this.seleccionarMEdida();

    if (this.editMode){
      this.loadMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value);

    }else{
       this.loadMedidasIDentificadas(this.medidasEmergentesForm.get('idAfectado')?.value);
    }

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
      mediasEmergentes: this.fb.array([], Validators.required),

    })

  }
  formularioMedidasEmergentes() {
   this.medidasEmergentesForm= this.fb.group({
      idAfectado: ['', Validators.required],
      idMedida: ['', Validators.required],
      medida: ['', Validators.required],
      periodo: ['', Validators.required],
      observaciones: ['', Validators.required],
      id: []
    });
  }



  //-------getters de formulario-----------------//
  get medidas(): FormArray {
  return this.avocatoriaForm.get('mediasEmergentes') as FormArray;
}

  // Devuelve solo las medidas que pertenecen al afectado actualmente seleccionado
  get filteredMedidas(): any[] {
    const idAfectado = Number(this.medidasEmergentesForm.get('idAfectado')?.value);
    if (!idAfectado) return [];
    return (this.medidas.value || []).filter((m: any) => Number(m.idAfectado) === idAfectado);
  }



  //---------------llenar formulario-----------------//
   agregarAfectado(): void {
  if (this.medidasEmergentesForm.valid) {
    this.medidas.push(this.fb.group(this.medidasEmergentesForm.value));
    this.medidasEmergentesForm.reset(); // limpio el form para el siguiente
  } else {
    this.medidasEmergentesForm.markAllAsTouched(); // para que muestre errores
  }
}

seleccionarMEdida() {
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

       /* // Populate mediasEmergentes FormArray
        const arr = this.avocatoriaForm.get('mediasEmergentes') as FormArray;
        // clear existing
        while (arr.length) arr.removeAt(0);

        // Backend may return the measures under different keys
        const medidasList = this.avocatoriacargada.mediasEmergentes ?? this.avocatoriacargada.medias ?? this.avocatoriacargada.medidasEmergentes ?? this.avocatoriacargada.medidas ?? [];

        if (Array.isArray(medidasList)) {
          medidasList.forEach((it: any) => {
            // normalize fields
            const idAfectado = it.idAfectado ?? it.id_afectado ?? it.idAfectadoSeleccionado ?? it.idAfectado ?? 0;
            const idMedida = it.idMedida ?? it.id_medida ?? it.idMedida ?? it.idMedida ?? null;
            const medidaTexto = it.medida ?? it.descripcion ?? it.texto ?? it.medida_text ?? '';
            const periodo = it.periodo ?? it.period ?? '';
            const observaciones = it.observaciones ?? it.obs ?? it.observation ?? '';

            arr.push(this.fb.group({
              idAfectado: [idAfectado],
              idMedida: [idMedida],
              medida: [medidaTexto],
              periodo: [periodo],
              observaciones: [observaciones]
            }));
          });
        }*/
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
   loadMedidasIDentificadas(id:number){

     if (!id) return;

  this.avocatoriaService.getMedidasIdentificadas(id)
    .subscribe((res: any) => {
      const lista = Array.isArray(res?.afectado) ? res.afectado : []; // [{ nombre, medida }, ...]

      for (const item of lista) {
        // evita re-agregar medidas que el usuario eliminó localmente
        const removedSet = this.removedMedidasByAfectado.get(id);
        if (removedSet && item.idMedida && removedSet.has(Number(item.idMedida))) {
          continue;
        }
        // evita duplicar por (afectado + texto de la medida)
        const yaExiste = this.medidas.controls.some(fg =>
          fg.get('idAfectado')?.value === id &&
          fg.get('medida')?.value === item.medida
        );
        if (yaExiste) continue;

        this.medidas.push(this.fb.group({
          idAfectado:    [id],       // viene del select
          idMedida:      [item.idMedida],             // aún no lo resolvemos
          medida:        [item.medida || ''],// texto para mostrar
          periodo:       [''],               // el usuario lo llenará
          observaciones: ['']                // el usuario lo llenará
        }));
      }

      // opcional: ver cómo quedó el array
      // console.log('mediasEmergentes:', this.medidas.getRawValue());
    });
  }
  loadMedidasEmergentes(id:number){
     if (!id) return;
  this.medidasService.getMedidasEmergentes(id)
    .subscribe((res: any) => {
      const lista = Array.isArray(res?.afectado) ? res.afectado : []; // [{ nombre, medida }, ...]
      for (const item of lista) {
         // evita duplicar por (afectado + texto de la medida)
        const yaExiste = this.medidas.controls.some(fg =>
          fg.get('idAfectado')?.value === id &&
          fg.get('medida')?.value === item.medida
        );
        if (yaExiste) continue;

        this.medidas.push(this.fb.group({
          idAfectado:    [id],       // viene del select
          idMedida:      [item.idMedida],             // aún no lo resolvemos
          medida:        [item.medida || ''],// texto para mostrar
          periodo:       [item.periodo || ''],               // el usuario lo llenará
          observaciones: [item.observaciones || ''],
          id:           [item.id || '']                // el usuario lo llenará
        }));
      }
      // opcional: ver cómo quedó el array
      // console.log('mediasEmergentes:', this.medidas.getRawValue());
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
  //-------otrso----/
  medidasEmergentes(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
  if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
  this.resetEditor();
  if (this.editMode){
    this.loadMedidasEmergentes(afectadoId);

  }else{
    this.loadMedidasIDentificadas(afectadoId);

  }


  }

   cambiarTab(tab: number) {
    this.currentTab = tab;
  }
  //-------guardar formualrio---------------//
  // Verifica si ya existe la medida para el mismo afectado (clave compuesta)
  isAgregada(idMedida: number, idAfectado: number): boolean {
    return this.medidas.controls.some(ctrl => {
      const mid = Number(ctrl.get('idMedida')?.value);
      const aid = Number(ctrl.get('idAfectado')?.value);
      return mid === Number(idMedida) && aid === Number(idAfectado);
    });
  }
  //MODIFICAR PARA EL EDITMODE     <-------------------
  agregarMedidas(){
    const fg = this.medidasEmergentesForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
    toast.error('Error al agregar medida', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
    if (this.editMode){
      this.agregarMedidaAfectadoEditMode(fg);

    }else{
      this.guardarDetalleMedidas(fg);
    }
    toast.success('Medida agregada con éxito', {
        duration: 3000,
      });

  }
  guardarDetalleMedidas(fg: FormGroup) {
  const v = fg.getRawValue(); // { idMedida, medida, periodo, observaciones }

  if (this.selectedIndex === null) {
  // Crear: valida duplicados por idMedida y afectado
  if (this.isAgregada(Number(v.idMedida), Number(v.idAfectado))) {
      toast.warning('Ya agregaste esta medida para este afectado', {
                duration: 3000,
              });
      return;
    }

    const fila = this.fb.group({
      idAfectado: [Number(v.idAfectado), Validators.required],
      idMedida: [Number(v.idMedida), Validators.required],
      medida: [v.medida, Validators.required],
      periodo: [v.periodo, Validators.required],
      observaciones: [v.observaciones, Validators.required],
    });

    this.medidas.push(fila);

  } else {
    // Actualizar la fila existente
    (this.medidas.at(this.selectedIndex) as FormGroup).patchValue({
      idMedida: Number(v.idMedida),
      medida: v.medida,
      periodo: v.periodo,
      observaciones: v.observaciones,
    });
  }

  this.resetEditor();
}

agregarMedidaAfectadoEditMode(fg: FormGroup){

  const body = { ...fg.value, idAvocatoria: this.idAvocatoria };
  this.medidasService.agregarMedidasEmergentes(body).subscribe({
    next: () => {

      this.loadMedidasEmergentes(fg.get('idAfectado')?.value);
      this.resetEditor();

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
  this.selectedIndex = null;
}

  // -----------Eliminar una medida aceptando índice o item (flexible)
  eliminar(itemOrIndex: any): void {
    if (!this.medidas) return;

    let index: number | null = null;

    if (typeof itemOrIndex === 'number') {
      index = itemOrIndex;
    } else if (itemOrIndex && (itemOrIndex.idMedida || itemOrIndex.idMedida === 0)) {
      // buscar por idMedida y idAfectado (clave compuesta)
      const idMedida = Number(itemOrIndex.idMedida);
      const idAfectado = Number(itemOrIndex.idAfectado ?? itemOrIndex.idAfectado);
      index = this.medidas.controls.findIndex(ctrl => Number(ctrl.get('idMedida')?.value) === idMedida && Number(ctrl.get('idAfectado')?.value) === idAfectado);
    } else if (typeof itemOrIndex === 'object') {
      // si recibimos directamente el control/value, intentar localizar hilo por igualdad de objeto
      index = this.medidas.controls.findIndex(ctrl => ctrl.value === itemOrIndex || JSON.stringify(ctrl.value) === JSON.stringify(itemOrIndex));
    }

    if (index === -1 || index === null) return;



    // Si la fila tiene idMedida (viene del backend), registrar su eliminación para no re-cargarla
    const fg = this.medidas.at(index) as FormGroup;
    const idMedidaVal = fg?.get('idMedida')?.value;
    const idAfectadoVal = fg?.get('idAfectado')?.value;
    if (idMedidaVal != null && idMedidaVal !== '' && idAfectadoVal != null) {
      const idMedidaNum = Number(idMedidaVal);
      const idAfectadoNum = Number(idAfectadoVal);
      let set = this.removedMedidasByAfectado.get(idAfectadoNum);
      if (!set) {
        set = new Set<number>();
        this.removedMedidasByAfectado.set(idAfectadoNum, set);
      }
      set.add(idMedidaNum);
    }

    this.medidas.removeAt(index);
  }

  // Editar una medida: carga la fila seleccionada en el formulario para editar

  editar(itemOrIndex: any): void {
    if (!this.medidas) return;

    let index: number | null = null;

    if (typeof itemOrIndex === 'number') {
      index = itemOrIndex;
    } else if (itemOrIndex && (itemOrIndex.idMedida || itemOrIndex.idMedida === 0)) {
      const idMedida = Number(itemOrIndex.idMedida);
      const idAfectado = Number(itemOrIndex.idAfectado ?? itemOrIndex.idAfectado);
      // localizar usando clave compuesta
      index = this.medidas.controls.findIndex(ctrl => Number(ctrl.get('idMedida')?.value) === idMedida && Number(ctrl.get('idAfectado')?.value) === idAfectado);
    } else if (typeof itemOrIndex === 'object') {
      index = this.medidas.controls.findIndex(ctrl => ctrl.value === itemOrIndex || JSON.stringify(ctrl.value) === JSON.stringify(itemOrIndex));
    }

    if (index === -1 || index === null) return;

    const fg = this.medidas.at(index) as FormGroup;
    this.medidasEmergentesForm.patchValue({
      idAfectado: fg.get('idAfectado')?.value,
      idMedida: fg.get('idMedida')?.value,
      medida: fg.get('medida')?.value,
      periodo: fg.get('periodo')?.value,
      observaciones: fg.get('observaciones')?.value,
      id: fg.get('id')?.value
    });
    this.selectedIndex = index;
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
  actualizarMedidasEditMode(){
    console.log('Editando medida en modo edición');
      this.medidasService.actualizarMedidasEmergentes(this.medidasEmergentesForm.get('id')?.value, this.medidasEmergentesForm.value).subscribe({
      next: () => {
        toast.success('Medida actualizada con éxito', {
          duration: 3000,
        });
        this.resetEditor();
        this.editMediasMode = false;
        const fg = this.medidasEmergentesForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
    return;
  }
  const v = fg.getRawValue();

  if (this.selectedIndex !==null) {
     (this.medidas.at(this.selectedIndex) as FormGroup).patchValue({
      idMedida: Number(v.idMedida),
      medida: v.medida,
      periodo: v.periodo,
      observaciones: v.observaciones,
    });

  }
        this.loadMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value);
      },
      error: (err) => {
        toast.error('Error al actualizar medida', {
          duration: 3000,
          description: err
        });
      }
    });
  }
//---------cancelar-------------------//
cancelar(): void {
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
