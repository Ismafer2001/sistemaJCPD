import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder,
   FormGroup,
    ReactiveFormsModule,
    Validators} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DenunciaService } from '@nna/services/denuncia.service';
import { MedidasService } from '@nna/services/medidas.service';
import { ResolucionesService } from '@nna/services/resoluciones.service';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
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
  TablaEditComponent,
NavFormularioComponent,
RouterLink]

})
export class Crear_resolucionesComponent implements OnInit {
 //--- Configuración de tabs------//
  tabsConfig: any[] = [
    {
      id: 0,
      label: 'Consideraciones'
    },
    {
      id: 1,
      label: 'Resoluciones'
    },
    {
      id: 2,
      label: 'Medidas Proteccion '
    },
    {
      id: 3,
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
 //variables Formulario//
 selectedIndex: number | null = null;
 resolucionesForm!: FormGroup
  codigoTramite: string ='';
  isEditResolucionesActivate: boolean = false;
  editMedidasMode: boolean = false;
grupo: string = '';
 medidasDefinitivasForm!:FormGroup;
    medidasDefinitivas: any[] = [];
    denunciaId!:number;
    afectados: any[] = [{id: 0, nombres: ''}];
     medidasPorArticulo: any[] = [];

  editMode: boolean = false;

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

   private configureEditCreateMode(): void {
  const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';

    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];

      if (params['modo'] === 'editar') {
        console.log('Modo editar activado '+ this.denunciaId);
        this.editMode = true;
        this.resolucionesForm.disable();
        this.medidasDefinitivasForm.disable();
         // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
        this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      };

     // Cargar afectados y dirigidoA cuando tengamos el idDenuncia
       if(this.editMode){
        this.cargarDatosEditMode(this.denunciaId);

      }

      this.LoadAfectados(this.denunciaId);
       this.loadDenunciaDetails(this.denunciaId);

    });
}

  ngOnInit() {
    this.formularioresoluciones();
    this.formularioMedidasDefinitivas();
     this.configureEditCreateMode();

    this.cargarMedidas();
    this.seleccionarMedida();



    this.medidasDefinitivasForm.valueChanges.subscribe(value => {
      console.log('Medidas Definitivas Form Value Changes:', value);
    })

    // Suscripción inteligente a cambios del formulario
    this.resolucionesForm.valueChanges.subscribe((value) => {
      console.log('Resoluciones Form Value Changes:', value);

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
    resolucion:[`<p>PRIMERO.-&nbsp;xxxxxxxxxxxxxxxxxxxx.&nbsp;</p><p>SEGUNDO.-.&nbsp;
      xxxxxxxxxxxxxxxxxxxxx&nbsp;</p><p>TERCERO.-</p>
      <p>xxxxxxxxxxxxxxxxxxxxxxx.&nbsp;</p><p>CUARTO.-&nbsp;xxxxxxxxxxxxxxxxxxxxxxxxxx&nbsp;</p>
      <p>QUINTO-</p><p>xxxxxxxxxxxxxxxxxxxxxxxxx.</p>
      <p>&nbsp;SEXTO-&nbsp;xxxxxxxxxxxxxxxxxxxxxx&nbsp;</p><p>SEPTIMO.-.</p>
      <p>xxxxxxxxxxxxxxxxxxxxx.&nbsp;</p><p>OCTAVO.-&nbsp;xxxxxxxxxxxxxxxxxxxxxxxxx.</p>
      <p>&nbsp;NOVENO.-&nbsp;CÚMPLASE&nbsp;Y</p><p>NOTIFÍQUESE.-&nbsp;Dado&nbsp;en&nbsp;
      Portoviejo,&nbsp;a&nbsp;los&nbsp;xxxxxx&nbsp;días&nbsp;del&nbsp;mes&nbsp;de&nbsp;
      xxxxxxxxx&nbsp;del&nbsp;año&nbsp;dos&nbsp;mil</p><p>xxxxxxxxx.-&nbsp;a&nbsp;las&nbsp;
      doce&nbsp;horas&nbsp;-F)&nbsp;Los&nbsp;Miembros&nbsp;de&nbsp;la&nbsp;Junta.</p>`],
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
        idDenuncia: this.denunciaId
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
        this.idResolucion = data.id || 0;
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
  agregarMedidasDefinitivas() {
  const body = {
      ...this.medidasDefinitivasForm.value,
    };
    this.medidasService.agregarMedidasDefinitivas(body).subscribe({
      next: () => {

          this.loadMedidasDefinitivas(this.medidasDefinitivasForm.get('idAfectado')?.value);
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
            this.loadMedidasDefinitivas(this.medidasDefinitivasForm.get('idAfectado')?.value);
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
    return;
  }
      this.medidasService.actualizarMedidasDefinitivas(this.medidasDefinitivasForm.get('id')?.value, this.medidasDefinitivasForm.value).subscribe({
      next: () => {
        toast.success('Medida actualizada con éxito', {
          duration: 3000,
        });
        this.resetEditor();
        this.editMedidasMode = false;


        this.loadMedidasDefinitivas(this.medidasDefinitivasForm.get('idAfectado')?.value);
      },
      error: (err) => {
        toast.error('Error al actualizar medida', {
          duration: 3000,
          description: err
        });
      }
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
 // Cancelar edición medidas
  cancelarEdicionMedidas(): void {
    this.editMedidasMode = false;
    this.medidasDefinitivasForm.reset();
  }


 //---------------------------OTROS-------------------//
   habilitarEdicion(){
    this.isEditResolucionesActivate=true;
    this.resolucionesForm.enable();
    this.medidasDefinitivasForm.enable();

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
          this.updateResolucion();

        }else{
          this.submitResoluciones();

        }

        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
//--------tabs----------------
   cambiarTab(tab: number) {
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
         this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditResolucionesActivate=false;
    this.resolucionesForm.disable();
    this.medidasDefinitivasForm.disable();


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
         this.router.navigate(['../../editar/'+ this.denunciaId], { relativeTo: this.route });



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

    this.resolucionesService.crearpdfBlob(this.idResolucion).subscribe((res: Blob) => {
      console.log('esta es el id del pdf', this.idResolucion);
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.actionsConfig[2].disabled = false
    });
    this.cambiarTab(3);
  }

}
export default Crear_resolucionesComponent;
