import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder,
   FormGroup,
    ReactiveFormsModule,
    Validators} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DenunciaService } from '@nna/services/denuncia.service';
import { MedidasService } from '@nna/services/medidas.service';
import { ResolucionesService } from '@nna/services/resoluciones.service';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { QuillModule } from 'ngx-quill';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-crear_resoluciones',
  templateUrl: './crear_resoluciones.component.html',
  imports: [CardFormComponent,
    CommonModule,
    ReactiveFormsModule,
    ButtonSubmitComponent,
    CommonModule,
    QuillModule,
  TablaEditComponent]

})
export class Crear_resolucionesComponent implements OnInit {
 currentTab = '0';
 //variables Formulario//
 resolucionesForm!: FormGroup
  codigoTramite: string ='';

 medidasDefinitivasForm!:FormGroup;
    medidasDefinitivas: any[] = [];
    denunciaId!:number;
    afectados: any[] = [{id: 0, nombres: ''}];
     medidasPorArticulo: any[] = [];
 //-------------------------------------
 //

 //Variables para controlar los botones//
  // Estados internos de botones
  private _pdfDisabled: boolean = true;
  private _guardarDisabled: boolean = false;
  private _editarDisabled: boolean = true;
  private cargandoDatosEdicion: boolean = false;

  // Getters para acceso público
  get pdfDisabled(): boolean { return this._pdfDisabled; }
  get guardarDisabled(): boolean { return this._guardarDisabled; }
  get editarDisabled(): boolean { return this._editarDisabled; }

  editMode: boolean = false;
  ignoreFirstValueChange: boolean = false;
  idResolucion!: number;
  //---------------------------///
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
pdfSrc: SafeResourceUrl | null = null;

  constructor(private fb: FormBuilder,
    private medidasService:MedidasService,
    private resolucionesService:ResolucionesService,
    private route: ActivatedRoute,
    private denunciaService:DenunciaService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) { }

  private actualizarEstadoBotones(): void {
    if (this.cargandoDatosEdicion) {
      return;
    }

    const formularioValido = this.resolucionesForm?.valid ?? false;
    const formularioTocado = this.resolucionesForm?.dirty || this.resolucionesForm?.touched;

    if (this.editMode) {
      // En modo edición: Guardar SIEMPRE deshabilitado
      this._guardarDisabled = true;

      if (!formularioTocado) {
        // Estado inicial: PDF habilitado, Editar deshabilitado
        this._pdfDisabled = false;
        this._editarDisabled = true;
      } else {
        // Cuando hay cambios: PDF deshabilitado, Editar habilitado
        this._pdfDisabled = true;
        this._editarDisabled = false;
      }
    } else {
      // En modo creación: Guardar habilitado (si válido y tocado), PDF y Editar deshabilitados
      this._guardarDisabled = !formularioValido || !formularioTocado;
      this._pdfDisabled = true;
      this._editarDisabled = true;
    }
  }

  ngOnInit() {
     this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;
        this.cargandoDatosEdicion = true;
        // En modo edición: PDF habilitado, Guardar deshabilitado, Editar deshabilitado
        this._pdfDisabled = false;
        this._guardarDisabled = true;
        this._editarDisabled = true;
        this.ignoreFirstValueChange = true;
        this.cargarDatosEditMode(this.denunciaId);
      }
      this.LoadAfectados(this.denunciaId);
       this.loadDenunciaDetails(this.denunciaId);

    });
    this.formularioMedidasDefinitivas();
    this.cargarMedidas();
    this.seleccionarMedida();
    this.formularioresoluciones();
    this.actualizarEstadoBotones();

    this.medidasDefinitivasForm.valueChanges.subscribe(value => {
      console.log('Medidas Definitivas Form Value Changes:', value);
    })

    // Suscripción inteligente a cambios del formulario
    this.resolucionesForm.valueChanges.subscribe(() => {
      if (this.ignoreFirstValueChange) {
        this.ignoreFirstValueChange = false;
        return;
      }

      if (this.cargandoDatosEdicion) {
        return;
      }

      // Actualizar estados según el modo y cambios
      this.actualizarEstadoBotones();
    });
  }

   LoadAfectados(id: number) {
    this.resolucionesService.getAfectados(id).subscribe({
      next: (data) => {
        this.afectados = data;
        console.log(this.afectados)
      },
      error: (err) => {
        console.error('Error al cargar los afectados', err);
      }
    });

  }
  //--------CRECION DE FORMULARIOS//
  formularioresoluciones(){
    this.resolucionesForm =this.fb.group({
      consideraciones: [`PRIMERO.- No se ha omitido solemnidad sustancial alguna que pueda determinar la nulidad del procedimiento administrativo de protección de derechos, por lo que este es válido, y así se lo declara.
SEGUNDO.- La Junta Cantonal de Protección de Derechos de …………….  es competente para conocer y resolver el presente caso de conformidad con lo que disponen:
……………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………
TERCERO.- Que, las Convenciones Internacionales de Derechos Humanos:
……………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………
…………………………………………………………………………………………………………………………………
CUARTO.- Que, en virtud de lo señalado por la Constitución de la República
……………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………
…………………………………………………………………………………………………………………………………
QUINTO.- Que, conforme lo establecido en el marco legal
……………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………
…………………………………………………………………………………………………………………………………
SEXTO.- Que, conforme lo establecido en el marco legal
……………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………
…………………………………………………………………………………………………………………………………

<strong>SÉPTIMO</strong>.- Que, conforme lo establecido en ………………………………..
Art            del  Código de la Niñez y Adolescencia
Art            de la Ley de personas adultas mayores/Resolución GAD…….
Art            de la Ley de prevención y erradicación de la violencia

Se ha escuchado a ………………………………….
………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………….
Reservadamente se escuchó al adolescente  ………………………………………….
OCTAVO.- Del análisis del presente procedimiento administrativo de protección de derechos, habiendo escuchado a las partes, la audiencia reservada y considerando los informes………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………
Este organismo determina que se trata de:
……………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………………
Por lo que este organismo en uso de nuestras atribuciones legales ……………………………………………………………………………………………….. y en ejercicio de nuestras funciones, esta JUNTA CANTONAL DE PROTECCIÓN DE DERECHOS
`],
    resolucion:[''],
    codigoTramite:[''],
    idDenuncia:[this.denunciaId]
    })
  }

  //load denuncia data
  loadDenunciaDetails(id: number) {
    this.denunciaService.obtenerDenuncia(id).subscribe(data => {
      // Aquí puedes manejar los detalles de la denuncia
      console.log('Detalles de la denuncia:', data);

      // Almacenar el código de trámite para usar en las URLs de descarga
      this.codigoTramite = data.codigoTramite || '';

      this.resolucionesForm.patchValue({
        codigoTramite: data.codigoTramite,
      });
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


    cargarDatosEditMode(idDenuncia:number){
      this.resolucionesService.getresolucion(idDenuncia).subscribe(data =>{
        this.idResolucion = data.id;
        this.resolucionesService.getResolucionEditMode(this.idResolucion).subscribe(data => {
          console.log('Datos de resolución en modo edición:', data);

          // Realizar patchValue con los datos cargados
          if (data) {
            this.resolucionesForm.patchValue({
              consideraciones: data.consideraciones || this.resolucionesForm.get('consideraciones')?.value,
              resolucion: data.resolucion || '',
              codigoTramite: data.codigoTramite || this.resolucionesForm.get('codigoTramite')?.value,
              idDenuncia: data.idDenuncia || this.denunciaId
            }, { emitEvent: false });

            // Finalizar carga de datos y actualizar botones
            this.cargandoDatosEdicion = false;
            this._pdfDisabled = false;
            this._editarDisabled = true;
            this.actualizarEstadoBotones();

            // Clear ignore flag para detectar cambios reales
            setTimeout(() => { this.ignoreFirstValueChange = false; }, 0);


          }
        });
      });
    }
    //Carga de datos de vulneraciones identificadas
  loadMedidasDefinitivas(id:number){
    if (!id) return;
  this.medidasService.getMedidasDefinitivas(id)
    .subscribe((data) => {
      this.medidasDefinitivas = data.afectado;
      console.log('Medidas Definitivas:', this.medidasDefinitivas);
    });
  }

  cargarMedidas() {
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
          this.medidasPorArticulo = response.data;
          console.log('Medidas por Artículo:', this.medidasPorArticulo);
      },
      error: () => {
        console.error('Error al cargar medidas:');
      }
    });
  }
  agregarMedidasDefinitivas() {
  const body = {
      ...this.medidasDefinitivasForm.value,
    };
    this.medidasService.agregarMedidasDefinitivas(body).subscribe(() =>{
      this.loadMedidasDefinitivas(this.medidasDefinitivasForm.get('idAfectado')?.value);
    });
}
   medidaDefinitiva(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
  console.log('Afectado seleccionado ID:', afectadoId);
  if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
  this.loadMedidasDefinitivas(afectadoId);

  }
 //funcion para autocompletar el input de vulneraciones del formulario de vulneraciones identificadas
 seleccionarMedida() {
  this.medidasDefinitivasForm.get('idMedida')!
    .valueChanges
    .subscribe((id: number | string) => {
      const numId = Number(id);
      // Busca el nombre en tu catálogo
      const encontrado = this.medidasPorArticulo
        .flatMap(articulo => articulo.medidas)
        .find(m => m.id === numId);


      this.medidasDefinitivasForm.patchValue(
        { medida: encontrado?.medida ?? '' },
        { emitEvent: false }
      );
    });

}


  // Método para manejar el click del botón Editar
  habilitarEdicion(): void {
    // Al hacer click en Editar: Editar se deshabilita, PDF se habilita
    this._editarDisabled = true;
    this._pdfDisabled = false;
  }

//--------tabs----------------
   cambiarTab(tab: string) {
    this.currentTab = tab;
  }

  updateResolucion() {
    if (this.resolucionesForm.invalid) {
      this.resolucionesForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        duration: 3000,
        description: 'Por Favor, Completa Todos los Campos Requeridos'
      });
      return;
    }

    const body = {
      ...this.resolucionesForm.value,
    };

    this.resolucionesService.actualizarResolucion(this.idResolucion, body).subscribe({
      next: (response) => {
        toast.success('Resolución Actualizada con Éxito', {
          duration: 3000,
        });
        // Marcar formulario como pristine para reflejar que no hay cambios pendientes
        this.resolucionesForm.markAsPristine();
        // Estados después de actualizar: Guardar deshabilitado, PDF habilitado, Editar deshabilitado
        this._guardarDisabled = true;
        this._pdfDisabled = false;
        this._editarDisabled = true;
      },
      error: (err) => {
        toast.error('Error al actualizar la resolución', {
          duration: 3000,
        });
      }
    });
  }

  submitResoluciones(){
     if (this.resolucionesForm.invalid) {
        this.resolucionesForm.markAllAsTouched();
        toast.error('Formulario inválido', {
          duration: 3000,
          description: 'Por Favor, Completa Todos los Campos Requeridos'
        });
        return;
      }
       const body ={
    ...this.resolucionesForm.value,

  }
  this.resolucionesService.postResolucion(body).subscribe({
      next: (response) => {
        this.idResolucion = response.id;
        this.editMode = true;
        toast.success('Resolución Guardada con Éxito', {
          duration: 3000,
        });

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
     this.router.navigate(['/nna/resoluciones/editar/'+this.denunciaId]);


  }

   generarPdf(){

    this.resolucionesService.crearpdfBlob(this.idResolucion).subscribe((res: Blob) => {
      console.log('esta es el id del pdf', this.idResolucion);
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab('3');
  }

}
export default Crear_resolucionesComponent;
