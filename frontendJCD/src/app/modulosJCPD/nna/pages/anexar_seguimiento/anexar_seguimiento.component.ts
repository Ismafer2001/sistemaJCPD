import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AnexarSeguimientoMedidasService } from '@nna/services/anexarSeguimientoMedidas.service';
import { DenunciaService } from '@nna/services/denuncia.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';

@Component({
  selector: 'app-anexar_seguimiento',
  templateUrl: './anexar_seguimiento.component.html',
  imports: [CardFormComponent, CommonModule, ReactiveFormsModule,TablaEditComponent]

})
export class Anexar_seguimientoComponent implements OnInit {

  afectados: any[] = [{id: 0, nombres: ''}];
  denunciaId: number = 0;
  codigoTramite: string = ''; // Almacenar el código de trámite
  seguimientoMedidasForm!: FormGroup;
  dragging = false;
  archivo: File | null = null;
  medidasPorCumplir: any[] = []; // Array para almacenar las medidas cargadas
  afectadoSeleccionado: number | null = null;
  tablaMedidasCumplidas: any[] = []; // Array para la tabla de informes guardados

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
    this.seguimientoMedidasForm.valueChanges.subscribe(val=>{
      console.log('Formulario cambiado:', val);
    })
  }

  // Getter para acceder al FormArray de medidas
  get medidasArray(): FormArray {
    return this.seguimientoMedidasForm.get('medidas') as FormArray;
  }
   loadDenunciaDetails(id: number) {
    this.denunciaService.obtenerDenuncia(id).subscribe(data => {
      // Aquí puedes manejar los detalles de la denuncia
      console.log('Detalles de la denuncia:', data);

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
      medidas: this.fb.array([]) // FormArray para las medidas dinámicas
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
        console.log('Medidas por cumplir - respuesta completa:', data);
        console.log('Tipo de data:', typeof data);
        console.log('Es array:', Array.isArray(data));

        this.medidasPorCumplir = data;
        this.construirFormularioMedidas(data);
      },
      error: (err) => {
        console.error('Error al cargar medidas por cumplir:', err);
        // En caso de error, limpiar las medidas
        this.limpiarMedidas();
      }
    });
  }

  loadMedidasCumplidas(idAfectado: number) {
    this.anexarSeguimientoMedidasService.getMedidasCumplidas(idAfectado).subscribe({
      next: (data) => {
        console.log('Medidas cumplidas - respuesta completa:', data);
        // Procesar datos y actualizar tabla
        this.procesarMedidasCumplidasReales(data);
      },
      error: (err) => {
        console.error('Error al cargar medidas cumplidas:', err);
        // Fallback a datos de prueba si hay error
        this.cargarDatosPrueba();
      }
    });
  }

  // Procesar los datos reales de medidas cumplidas
  procesarMedidasCumplidasReales(data: any[]) {
    if (!Array.isArray(data)) {
      console.warn('Los datos no son un array, usando datos de prueba');
      this.cargarDatosPrueba();
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
        medidasCumplidas: medidasCumplidas,
        medidasNoCumplidas: medidasNoCumplidas,
        fechaCreacion: fechaFormateada,
        codigoTramite: item.codigoTramite || 'N/A',
        nombreArchivoOriginal: nombreArchivo,
        // Métodos de acción personalizados
        descargar: () => this.descargarArchivo(nombreArchivo)
      };
    });

    console.log('Tabla de medidas cumplidas procesada:', this.tablaMedidasCumplidas);
  }  construirFormularioMedidas(medidas: any) {
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

    console.log('Medidas procesadas como array:', medidasArray);

    // Crear un FormGroup para cada medida
    medidasArray.forEach((medida, index) => {
      const medidaFormGroup = this.fb.group({
        idMedida: [medida.id || medida.idMedida || index, Validators.required],
        nombreMedida: [medida.medida || medida.nombre || medida.descripcion || `Medida ${index + 1}`, Validators.required],
        cumple: [null, Validators.required] // null para forzar selección
      });

      this.medidasArray.push(medidaFormGroup);
    });    console.log('FormArray de medidas construido:', this.medidasArray.value);
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
      console.log(`Medida ${index} actualizada - Cumple: ${cumple}`);
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
    formData.append('medidas', JSON.stringify(medidasParaEnviar));

    console.log('FormData preparado:', {
      archivo: this.archivo.name,
      codigoTramite: formValue.codigoTramite,
      tipoCarpeta: formValue.tipoCarpeta,
      medidas: medidasParaEnviar
    });

    this.anexarSeguimientoMedidasService.uploadArchivo(formData, formValue.codigoTramite, formValue.tipoCarpeta).subscribe({
      next: (response) => {
        console.log('Archivo subido con éxito:', response);
        // Recargar la tabla después de subir
        this.cargarInformesCumplimiento();
        // Opcional: resetear formulario
        this.resetearFormulario();
      },
      error: (error) => {
        console.error('Error al subir el archivo:', error);
      }
    });
  }

  // Cargar informes de cumplimiento existentes para mostrar en la tabla
  cargarInformesCumplimiento() {
    if (this.afectadoSeleccionado) {
      // Si hay un afectado seleccionado, cargar sus medidas cumplidas reales
      console.log('Cargando informes reales para afectado:', this.afectadoSeleccionado);
      this.loadMedidasCumplidas(this.afectadoSeleccionado);
    } else {
      // Si no hay afectado seleccionado, usar datos de prueba
      console.log('No hay afectado seleccionado, usando datos de prueba...');
      this.cargarDatosPrueba();
    }
  }

  // Cargar datos de prueba para la tabla
  cargarDatosPrueba() {
    const datosPrueba = [
      {
        id: 1,
        nombreArchivo: 'informe_cumplimiento_01.pdf',
        medidas: [
          { idMedida: 1, cumple: true },
          { idMedida: 2, cumple: false },
          { idMedida: 3, cumple: true }
        ],
        fechaCreacion: new Date().toISOString(),
        codigoTramite: 'TRM-2024-001'
      },
      {
        id: 2,
        nombreArchivo: 'informe_cumplimiento_02.pdf',
        medidas: [
          { idMedida: 1, cumple: true },
          { idMedida: 2, cumple: true }
        ],
        fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // hace 7 días
        codigoTramite: 'TRM-2024-002'
      }
    ];

    this.tablaMedidasCumplidas = this.procesarDatosTabla(datosPrueba);
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

  // Generar enlace de descarga para el archivo
  /*generarEnlaceDescarga(nombreArchivo: string): string {
    if (!nombreArchivo) return 'Archivo no disponible';

    // Construir URL de descarga usando el middleware express.static
    const baseUrl = 'http://localhost:3000'; // http://localhost:4200 o tu dominio
    const downloadUrl = `${baseUrl}/files/${nombreArchivo}`;

    return `<a href="${downloadUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 underline" download>
              <i class="fas fa-download mr-1"></i>Descargar
            </a>`;
  }*/

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
    const baseUrl = 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/files/${this.codigoTramite}/seguimiento/${nombreArchivo}`;
    console.log('Iniciando descarga desde URL:', downloadUrl);

    // Crear elemento <a> temporal para forzar descarga
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Resetear formulario después de envío exitoso
  resetearFormulario() {
    this.archivo = null;
    this.afectadoSeleccionado = null;
     // Limpiar también el código de trámite
    this.limpiarMedidas();
    this.tablaMedidasCumplidas = []; // Limpiar también la tabla
    this.seguimientoMedidasForm.reset({
      archivo: null,
      tipoCarpeta: 'seguimiento',
      idAfectado: ''
    });
  }

  // TrackBy function para optimizar *ngFor
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}


export default Anexar_seguimientoComponent;
