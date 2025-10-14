
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

  //variables de formularios//
  audienciaPruebaForm!: FormGroup;
  participantesForm!: FormGroup;
  testimoniosForm!: FormGroup;
  pruebasForm!: FormGroup;
  medidasDefinitivasForm!: FormGroup;
  vulneracionesIdentificadasForm!: FormGroup;
  //-------------------------------//
  afectados: any[] = [{id: 0, nombres: ''}];
  removedMedidasByAfectado: Map<number, Set<number>> = new Map();
  selectedIndex: number | null = null;

  removedVulneracionesByAfectado: Map<number, Set<number>> = new Map();
  vulneraciones: Vulneracion[] = [];

  participantes: involucrados[] = [];
  vulneracionesIdentificadas: vulneracionesIdentificadas[] = [];
  medidasPorArticulo: ArticuloMedidas[] = [];
  datosAudienciaPrueba: any;
  miembrosPrincipales: any[] = [];
  pdfSrc: SafeResourceUrl | null = null;
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;
  idAudienciaP!: number;

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
      // Cargar afectados y dirigidoA cuando tengamos el idDenuncia
      this.cargarAfectadosYDirigidoA();

      this.cargarDatosAudiencia()
      this.LoadAfectados(this.denunciaId)


    });
    this.formulariopruebas();
    this.formularioTestimonios();

    this.principalesActivos();
    // Inicializar formulario de audiencia
    this.formularioAudienciaPrueba();
    this.formularioParticipantes()
    this.formularioMedidasDefinitivas()
    this.formularioVulneracionesIdentificadas()
    //inicialiar carga de datos
    this.loadMedidasEmergentes(this.medidasDefinitivasForm.get('idAfectado')?.value);
    this.cargarMedidas();
    this.loadVulneraciones();
    this.loadVulneracionesIdentificadas(this.vulneracionesIdentificadasForm.get('idAfectado')?.value)
    this.seleccionarMEdida();
    this.seleccionarVulneracion();


    this.participantesForm.get('idDenuncia')?.setValue(this.denunciaId);

    this.audienciaPruebaForm.valueChanges.subscribe(value => {
      console.log('Audiencia Form Value Changes:', value);
      // Si el formulario cambia después de guardar, deshabilita PDF y edición
      if (!this.guardarDisabled) return; // Solo si ya se guardó
      this.pdfDisabled = true;
      this.editarDisabled = false;
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

 loadMedidasEmergentes(id:number){
     if (!id) return;
  this.audienciaPruebasService.getMedidasEmergentes(id)
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
          periodo:       [item.periodo || ''],               // el usuario lo llenará
          observaciones: [item.observaciones || '']                // el usuario lo llenará
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

    //-------guardar formualrio---------------//
    medidasDefinitivas(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
  if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
  this.resetEditor();
  this.loadMedidasEmergentes(afectadoId);

  }
  // Verifica si ya existe la medida para el mismo afectado (clave compuesta)
  isAgregada(idMedida: number, idAfectado: number): boolean {
    return this.medidas.controls.some(ctrl => {
      const mid = Number(ctrl.get('idMedida')?.value);
      const aid = Number(ctrl.get('idAfectado')?.value);
      return mid === Number(idMedida) && aid === Number(idAfectado);
    });
  }
  guardarDetalle() {
    console.log('Guardando detalle de medida emergente');
  const fg = this.medidasDefinitivasForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
    console.log('Formulario de medida inválido');
    return;

  }

  const v = fg.getRawValue(); // { idMedida, medida, periodo, observaciones }

  if (this.selectedIndex === null) {
  // Crear: valida duplicados por idMedida y afectado
  if (this.isAgregada(Number(v.idMedida), Number(v.idAfectado))) {
      // aquí puedes mostrar un mensaje al usuario si quieres
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
    this.medidasDefinitivasForm.patchValue({
      idAfectado: fg.get('idAfectado')?.value,
      idMedida: fg.get('idMedida')?.value,
      medida: fg.get('medida')?.value,
      periodo: fg.get('periodo')?.value,
      observaciones: fg.get('observaciones')?.value,
    });
    this.selectedIndex = index;
  }

  //-----SECCION PARTICIPANTES-----//





   //-------------Formularios----------------------//
  formularioAudienciaPrueba() {
    const now = new Date();
    const horaActual = now.toTimeString().slice(0,5); // 'HH:mm'
    const fechaActual = now.toISOString().substring(0,10); // 'YYYY-MM-DD'
    this.audienciaPruebaForm = this.fb.group({
      idDenuncia: [this.denunciaId || 0],
      codigoTramite: [''],
      Hora: [horaActual],
      fecha: [fechaActual],
      intalacionAudiencia: [''],
      afectadoManifiesta: [''],
      participantes: this.fb.array([]),
      medidasDefinitivas: this.fb.array([], Validators.required),
    });
  }

  formularioParticipantes() {
    this.participantesForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      tipoParticipante: ['', Validators.required],
      pruebas: ['', Validators.required],
      parte: ['', Validators.required],
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
    return this.audienciaPruebaForm.get('participantes') as FormArray;
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
  // Getter para la tabla de testimonios (nombre completo y testimonio)
  get testimoniosTabla() {
    return this.participantesArray.getRawValue()
      .filter((p: any) => p.testimonio && p.testimonio.trim() !== '')
      .map((p: any) => ({
        nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
        testimonio: p.testimonio || '',
        parte: p.parte || ''
      }));
  }
   // Getter para la tabla de pruebas (nombre completo y pruebas)
  get pruebasTabla() {
    return this.participantesArray.getRawValue()
      .filter((p: any) => p.pruebas && p.pruebas.trim() !== '')
      .map((p: any) => ({
        nombreCompleto: (p.nombres || '') + ' ' + (p.apellidos || ''),
        pruebas: p.pruebas || '',
        parte: p.parte || ''
      }));
  }



  // Método para agregar el testimonio al participante seleccionado
  agregarTestimoniosParticipante() {
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

   // Método para agregar pruebas al participante seleccionado
  agregarPruebasParticipante() {
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
  cargarDatosAudiencia() {
    if (!this.denunciaId) return;
    this.audienciaPruebasService.getDatosAudiencia(this.denunciaId).subscribe(data => {
      this.datosAudienciaPrueba = data;
      console.log('Datos de audiencia cargados', data);
      this.audienciaPruebaForm.patchValue({
        codigoTramite: this.datosAudienciaPrueba.codigoTramite,
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
 cancelar(): void {
    this.router.navigate(['/nna/fases/'+ this.datosAudienciaPrueba?.id]);
  }
   //--editar
      updateAudiencia() {
      const body ={
        ...this.audienciaPruebaForm.value,


      }
      this.audienciaPruebasService.actualizarAudienciaPrueba(this.idAudienciaP, body).subscribe({
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
    this.audienciaPruebasService.postCrearParticipante(body).subscribe(() => {
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

    this.audienciaPruebasService.crearpdfBlob(this.idAudienciaP).subscribe((res: Blob) => {
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab("3");
  }


}
export default Crear_audiencia_pruebaComponent;
