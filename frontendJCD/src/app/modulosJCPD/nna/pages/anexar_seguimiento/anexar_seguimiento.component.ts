import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnexarSeguimientoMedidasService } from '@nna/services/anexarSeguimientoMedidas.service';
import { DenunciaService } from '@nna/services/denuncia.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';

import { CumpleMedidasTablaComponent } from './cumpleMedidasTabla/cumpleMedidasTabla.component';
import { environment } from 'environments/environment';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

@Component({
  selector: 'app-anexar_seguimiento',
  templateUrl: './anexar_seguimiento.component.html',
  imports: [
    CardFormComponent,
    CommonModule,
    ReactiveFormsModule,
    CumpleMedidasTablaComponent,
    RouterLink,
    ButtonSubmitComponent
  ]

})
export class Anexar_seguimientoComponent implements OnInit {
  // Loader para botón de informe
  loadingBtnSeguimiento: boolean = false;
  loadingBtnSeguimientoMsg: string = '';

  afectados: any[] = [{id: 0, nombres: ''}];
  denunciaId: number = 0;
  codigoTramite: string = ''; // Almacenar el código de trámite
  seguimientoMedidasForm!: FormGroup;
  dragging = false;
  archivo: File | null = null;
  medidasPorCumplir: any[] = []; // Array para almacenar las medidas cargadas
  afectadoSeleccionado: number | null = null;
  tablaMedidasCumplidas: any[] = []; // Array para la tabla de informes guardados
  editMode: boolean = false; // Controlar si estamos en modo edición
  editingItemId: number | null = null; // ID del item que estamos editando
  loading: boolean = false; // Controlar el estado de carga
  loadingMessage: string = ''; // Mensaje del loader

  medidasEjemplo = [{
      idMedida: 7,
      idAfectado: 15,

      cumple: true
    },
    ]

  constructor(private anexarSeguimientoMedidasService: AnexarSeguimientoMedidasService,
    private route: ActivatedRoute,
    private fb:FormBuilder,
    private denunciaService: DenunciaService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      this.LoadAfectados(this.denunciaId);
      this.loadDenunciaDetails(this.denunciaId);
      this.cargarInformesCumplimiento(); // Cargar informes existentes
    });
    this.formularioSeguimientoMedidas();

  }

  // Getter para acceder al FormArray de medidas
  get medidasArray(): FormArray {
    return this.seguimientoMedidasForm.get('medidas') as FormArray;
  }
   loadDenunciaDetails(id: number) {
    this.denunciaService.obtenerDenuncia(id).subscribe(data => {
      // Aquí puedes manejar los detalles de la denuncia


      // Almacenar el código de trámite para usar en las URLs de descarga
      this.codigoTramite = data.codigoTramite || '';

      this.seguimientoMedidasForm.patchValue({
        codigoTramite: data.codigoTramite,
      });
    });
  }

  LoadAfectados(id: number) {
    this.anexarSeguimientoMedidasService.getAfectados(id).subscribe({
      next: (data) => {
        this.afectados = data;
        console.log(this.afectados)
      },
      error: (err) => {
        console.error('Error al cargar los afectados', err);
      }
    });
  }

  formularioSeguimientoMedidas(){
    this.seguimientoMedidasForm = this.fb.group({
      archivo: [null, Validators.required],
      codigoTramite: ['', Validators.required],
      tipoCarpeta: ['seguimiento', Validators.required],
      idAfectado: ['', Validators.required], // Añadido para el afectado seleccionado
      responsable: ['', Validators.required], // Nuevo campo
      razon: ['', Validators.required], // Nuevo campo
      sancion: ['', Validators.required], // Nuevo campo
      medidas: this.fb.array([]), // FormArray para las medidas dinámicas
      idPath: ['0', Validators.required] //
    });
  }

  // Método que se ejecuta cuando se selecciona un afectado
  onAfectadoSeleccionado(event: any) {
    const afectadoId = Number(event.target.value);
    if (afectadoId) {
      this.afectadoSeleccionado = afectadoId;

      // Actualizar el formulario con el afectado seleccionado
      this.seguimientoMedidasForm.patchValue({
        idAfectado: afectadoId
      });

      // Cargar las medidas para este afectado
      this.loadMediadasPorCumplir(afectadoId);
      this.loadMedidasCumplidas(afectadoId);
    } else {
      // Limpiar medidas si no hay afectado seleccionado
      this.limpiarMedidas();
      this.tablaMedidasCumplidas = []; // Limpiar también la tabla
    }
  }

  loadMediadasPorCumplir(idAfectado: number) {
    this.anexarSeguimientoMedidasService.getMedidasporCumplir(idAfectado).subscribe({
      next: (data) => {

        this.medidasPorCumplir = data;
        this.construirFormularioMedidas(data);
      },
      error: (err) => {
        console.error('Error al cargar medidas por cumplir:', err);
        this.limpiarMedidas();
      }
    });
  }

  loadMedidasCumplidas(idAfectado: number) {
    this.anexarSeguimientoMedidasService.getMedidasCumplidas(idAfectado).subscribe({
      next: (data) => {


        // Procesar datos y actualizar tabla
        this.procesarMedidasCumplidasReales(data);

      },
      error: (err) => {
        console.error('Error al cargar medidas cumplidas:', err);
        // Fallback a datos de prueba si hay error

      }
    });
  }

  // Nuevo método para cargar medidas definitivas usando getMedidasDeAfectados
  loadMedidasDefinitivas(idAfectado: number) {
    this.anexarSeguimientoMedidasService.getMedidasDeAfectados(idAfectado).subscribe({
      next: (data) => {

        // El servicio ya retorna el formato correcto: [{ idMedida, medida, idAfectado }]
        this.construirFormularioMedidasDefinitivas(data.data);
      },
      error: (err) => {
        console.error('Error al cargar medidas definitivas:', err);
        this.limpiarMedidas();
      }
    });
  }

  // Procesar los datos reales de medidas cumplidas
  procesarMedidasCumplidasReales(data: any[]) {
    if (!Array.isArray(data)) {
      console.warn('Los datos no son un array, usando datos de prueba');

      return;
    }


    this.tablaMedidasCumplidas = data.map((item, index) => {
      // Extraer información del archivo
      const archivo = item.archivo || {};
      const nombreArchivo = archivo.fileName || archivo.path || 'archivo_sin_nombre.pdf';

      // Procesar medidas cumplidas y no cumplidas - contar las medidas
      const medidasCumplidas = Array.isArray(item.cumplemedida) ? item.cumplemedida.length : 0;
      const medidasNoCumplidas = Array.isArray(item.nocumplemedida) ? item.nocumplemedida.length : 0;

      // Formatear fecha (si existe)
      const fecha = item.fechaCreacion || item.createdAt || new Date();
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES');

      return {
        id: item.id || index + 1,
        n: index + 1,
        archivo: 'Descargar PDF',
        responsable: archivo.responsable || 'No especificado',
        razon: archivo.razon || 'No especificada',
        sancion: archivo.sancion || 'No especificada',
        medidasCumplidas: medidasCumplidas,
        medidasNoCumplidas: medidasNoCumplidas,
        fechaCreacion: fechaFormateada,
        codigoTramite: item.codigoTramite || 'N/A',
        nombreArchivoOriginal: nombreArchivo,
        idAfectado: archivo.idAfectado || null,
        idPath: archivo.idPath || '0',
        // Métodos de acción personalizados
        descargar: () => this.descargarArchivo(nombreArchivo)
      };
    });


  }

   construirFormularioMedidas(medidas: any) {
    // Limpiar el FormArray actual
    this.limpiarMedidas();

    // Validar que medidas sea un array
    let medidasArray: any[] = [];

    if (Array.isArray(medidas)) {
      medidasArray = medidas;
    } else if (medidas && typeof medidas === 'object') {
      // Si es un objeto, intentar extraer un array
      if (medidas.data && Array.isArray(medidas.data)) {
        medidasArray = medidas.data;
      } else if (medidas.medidas && Array.isArray(medidas.medidas)) {
        medidasArray = medidas.medidas;
      } else {
        console.warn('Medidas recibidas no están en formato array:', medidas);
        return;
      }
    } else {
      console.warn('Medidas recibidas no son válidas:', medidas);
      return;
    }



    // Crear un FormGroup para cada medida
    medidasArray.forEach((medida, index) => {
      const medidaFormGroup = this.fb.group({
        idMedida: [medida.id || medida.idMedida || index, Validators.required],
        nombreMedida: [medida.medida || medida.nombre || medida.descripcion || `Medida ${index + 1}`, Validators.required],
        cumple: [null, Validators.required] // null para forzar selección
      });

      this.medidasArray.push(medidaFormGroup);
    });


  }

  // Método específico para construir formulario con medidas definitivas
  construirFormularioMedidasDefinitivas(medidas: any[]) {
    // Limpiar el FormArray actual
    this.limpiarMedidas();

    // Verificar que sea un array
    if (!Array.isArray(medidas)) {
      console.warn('Las medidas definitivas no son un array:', medidas);
      return;
    }



    // Crear un FormGroup para cada medida usando el formato del servicio
    medidas.forEach((medida, index) => {
      const medidaFormGroup = this.fb.group({
        idMedida: [medida.idMedida, Validators.required],
        nombreMedida: [medida.medida, Validators.required], // Usar 'medida' del servicio
        cumple: [null, Validators.required] // null para forzar selección
      });

      this.medidasArray.push(medidaFormGroup);
    });


  }

  limpiarMedidas() {
    while (this.medidasArray.length !== 0) {
      this.medidasArray.removeAt(0);
    }
  }

  // Método para obtener el estado de cumplimiento de una medida específica
  getMedidaCumple(index: number): boolean | null {
    const medidaControl = this.medidasArray.at(index);
    return medidaControl ? medidaControl.get('cumple')?.value : null;
  }

  // Método para actualizar el cumplimiento de una medida
  onCumplimientoChange(index: number, cumple: boolean) {
    const medidaControl = this.medidasArray.at(index);
    if (medidaControl) {
      medidaControl.patchValue({ cumple });

    }
  }

  onFileSelected(event: any) {
    this.archivo = event.target.files[0];
    this.seguimientoMedidasForm.patchValue({ archivo: this.archivo });
    console.log('Archivo seleccionado:', this.seguimientoMedidasForm.value.archivo);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.onFileSelected({ target: { files: event.dataTransfer.files } });
    }
  }

  subirArchivo() {
    if (!this.seguimientoMedidasForm.valid || !this.archivo) {
      console.log('Formulario no válido o archivo no seleccionado');
      this.seguimientoMedidasForm.markAllAsTouched();
      return;
    }

    // Activar loader
    this.loading = true;
    this.loadingMessage = 'Guardando informe...';

    const formData = new FormData();
    const formValue = this.seguimientoMedidasForm.value;

    // Preparar el array de medidas con el formato requerido
    const medidasParaEnviar = this.medidasArray.value.map((medida: any) => ({
      idMedida: medida.idMedida,
      idAfectado: this.afectadoSeleccionado,
      cumple: medida.cumple
    }));

    formData.append('archivo', this.archivo);
    formData.append('codigoTramite', formValue.codigoTramite);
    formData.append('tipoCarpeta', formValue.tipoCarpeta);
    formData.append('responsable', formValue.responsable);
    formData.append('razon', formValue.razon);
    formData.append('sancion', formValue.sancion);

    formData.append('medidas', JSON.stringify(medidasParaEnviar));

    console.log('FormData preparado:', {
      archivo: this.archivo.name,
      codigoTramite: formValue.codigoTramite,
      tipoCarpeta: formValue.tipoCarpeta,
      responsable: formValue.responsable,
      razon: formValue.razon,
      sancion: formValue.sancion,
      medidas: medidasParaEnviar
    });

    this.anexarSeguimientoMedidasService.uploadArchivo(formData, formValue.codigoTramite, formValue.tipoCarpeta).subscribe({
      next: (response) => {
        console.log('Archivo subido con éxito:', response);
        this.loading = false; // Desactivar loader
        // Recargar la tabla después de subir
        this.cargarInformesCumplimiento();
        // Opcional: resetear formulario
        this.resetearFormulario();
      },
      error: (error) => {
        console.error('Error al subir el archivo:', error);
        this.loading = false; // Desactivar loader
      }
    });
  }
  actualizarSeguimiento() {
    if (!this.seguimientoMedidasForm.valid || !this.archivo) {
      console.log('Formulario no válido o archivo no seleccionado');
      this.seguimientoMedidasForm.markAllAsTouched();
      return;
    }

    // Activar loader
    this.loading = true;
    this.loadingMessage = 'Actualizando informe...';
    this.loadingBtnSeguimiento = true;
    this.loadingBtnSeguimientoMsg = 'Actualizando informe...';

    const formData = new FormData();
    const formValue = this.seguimientoMedidasForm.value;
    const medidasParaEnviar = this.medidasArray.value.map((medida: any) => ({
      idMedida: medida.idMedida,
      idAfectado: this.afectadoSeleccionado,
      cumple: medida.cumple
    }));

    formData.append('archivo', this.archivo);
    formData.append('codigoTramite', formValue.codigoTramite);
    formData.append('tipoCarpeta', formValue.tipoCarpeta);
     formData.append('responsable', formValue.responsable);
    formData.append('razon', formValue.razon);
    formData.append('sancion', formValue.sancion);

 formData.append('idPath', formValue.idPath);

    formData.append('medidas', JSON.stringify(medidasParaEnviar));

    this.anexarSeguimientoMedidasService.updateseguimiento(formData, formValue.codigoTramite, formValue.tipoCarpeta).subscribe({
      next: (response) => {
        console.log('Archivo subido con éxito:', response);
        this.loading = false; // Desactivar loader
        this.loadingBtnSeguimiento = false;
        this.loadingBtnSeguimientoMsg = '';
        // Recargar la tabla después de subir
        this.cargarInformesCumplimiento();
        // Opcional: resetear formulario
        this.resetearFormulario();
      },
      error: (error) => {
        console.error('Error al subir el archivo:', error);
        this.loading = false; // Desactivar loader
        this.loadingBtnSeguimiento = false;
        this.loadingBtnSeguimientoMsg = '';
      }
    });

  }

  // Cargar informes de cumplimiento existentes para mostrar en la tabla
  cargarInformesCumplimiento() {
    if (this.afectadoSeleccionado) {
      // Si hay un afectado seleccionado, cargar sus medidas cumplidas reales

      this.loadMedidasCumplidas(this.afectadoSeleccionado);
    }
  }



  // Procesar los datos para mostrar en la tabla
  procesarDatosTabla(informes: any[]): any[] {
    return informes.map((informe, index) => {
      // Contar medidas cumplidas y no cumplidas
      const medidas = Array.isArray(informe.medidas) ? informe.medidas :
                     typeof informe.medidas === 'string' ? JSON.parse(informe.medidas) : [];
      const medidasCumplidas = medidas.filter((m: any) => m.cumple === true).length;
      const medidasNoCumplidas = medidas.filter((m: any) => m.cumple === false).length;

      // Formatear fecha
      const fecha = informe.fechaCreacion || informe.createdAt || new Date();
      const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES');

      return {
        id: informe.id || index,
        n: index + 1,
        archivo: `Descargar PDF`,
        responsable: informe.responsable || 'No especificado',
        razon: informe.razon || 'No especificada',
        sancion: informe.sancion || 'No especificada',
        medidasCumplidas: medidasCumplidas,
        medidasNoCumplidas: medidasNoCumplidas,
        fechaCreacion: fechaFormateada,
        codigoTramite: informe.codigoTramite,
        nombreArchivoOriginal: informe.nombreArchivo || informe.archivo,
        // Métodos de acción personalizados
        descargar: () => this.descargarArchivo(informe.nombreArchivo || informe.archivo)
      };
    });
  }



  // Método para descargar archivo directamente
  descargarArchivo(event: any) {
    let nombreArchivo: string;

    // Si viene un string directamente
    if (typeof event === 'string') {
      nombreArchivo = event;
    }
    // Si viene un objeto con el nombre del archivo
    else if (event && event.nombreArchivoOriginal) {
      nombreArchivo = event.nombreArchivoOriginal;
    }
    // Si viene un evento DOM
    else if (event && event.target && event.target.dataset && event.target.dataset.archivo) {
      nombreArchivo = event.target.dataset.archivo;
    }
    else {
      console.warn('No se pudo determinar el nombre del archivo');
      return;
    }

    if (!nombreArchivo) {
      console.warn('Nombre de archivo no válido');
      return;
    }
    

    if (!this.codigoTramite) {
      console.warn('Código de trámite no disponible');
      return;
    }

    // Construir URL con la estructura: /files/{codigoTramite}/seguimiento/{nombreArchivo}
    const baseUrl = environment.CLIENT_URL;
    const downloadUrl = `${baseUrl}/files/${this.codigoTramite}/seguimiento/${nombreArchivo}`;
    console.log('Iniciando descarga desde URL:', downloadUrl);

   this.anexarSeguimientoMedidasService.descargarArchivoSeguro(this.codigoTramite, nombreArchivo).subscribe({

    next: (blob: Blob) => {
      const fileBlob = new Blob([blob], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(fileBlob);

      // Abrimos la pestaña
      const nuevaVentana = window.open(fileURL, '_blank');

      // Intentamos cambiar el título de la pestaña para que al descargar sugiera ese nombre
      if (nuevaVentana) {
        nuevaVentana.document.title = nombreArchivo;
      }

    },
    error: (err) => {
      console.error('Error al descargar: Posible falta de permisos o archivo inexistente', err);
      console.log(this.codigoTramite, nombreArchivo)
    }
  });
  }

  // Método para editar un registro de la tabla
  editarRegistro(item: any) {
    console.log('Editando registro:', item);
    this.editMode = true;
    this.editingItemId = item.id;

    // Seleccionar el afectado correspondiente
    this.afectadoSeleccionado = item.idAfectado;

    this.seguimientoMedidasForm.patchValue({
      idAfectado: item.idAfectado,
      responsable: item.responsable,
      razon: item.razon,
      sancion: item.sancion,
      idPath: item.idPath
    });

    // 🔥 CAMBIO: Usar getMedidasDeAfectados para cargar las medidas definitivas cuando editamos
    this.loadMedidasDefinitivas(item.idAfectado);
    this.loadMedidasCumplidas(item.idAfectado);

    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método para cancelar la edición
  cancelarEdicion() {
    this.editMode = false;
    this.editingItemId = null;
    this.afectadoSeleccionado = null;
    this.limpiarMedidas();
    this.seguimientoMedidasForm.reset({
      archivo: null,
      tipoCarpeta: 'seguimiento',
      idAfectado: '',
      responsable: '',
      razon: '',
      sancion: ''
    });
    this.archivo = null;
  }

  // Resetear formulario después de envío exitoso
  resetearFormulario() {
    this.archivo = null;
    this.afectadoSeleccionado = null;
    this.editMode = false; // Salir del modo edición
    this.editingItemId = null; // Limpiar ID de edición
     // Limpiar también el código de trámite
    this.limpiarMedidas();
    this.tablaMedidasCumplidas = []; // Limpiar también la tabla
    this.seguimientoMedidasForm.reset({
      archivo: null,
      tipoCarpeta: 'seguimiento',
      idAfectado: '',
      responsable: '',
      razon: '',
      sancion: ''
    });
  }

  // TrackBy function para optimizar *ngFor
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}


export default Anexar_seguimientoComponent;
