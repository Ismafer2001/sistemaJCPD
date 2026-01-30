import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvocatoriaService } from '@nna/services/avocatoria.service';
import { ArticuloMedidas, MedidasService } from '@nna/services/medidas.service';
import { ProvidenciaService } from '@nna/services/providencia.service';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import InputsComponent from '@shared/components/inputs/inputs.component';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { QuillModule } from 'ngx-quill';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-crear_providencia',
  templateUrl: './crear_providencia.component.html',
  imports: [ReactiveFormsModule,
    QuillModule,
    CardFormComponent,
    NavFormularioComponent,
    ButtonSubmitComponent,
    RouterLink,
    InputsComponent,
    TablaEditComponent,
  CommonModule  ],

})
export class Crear_providenciaComponent implements OnInit {
  idAvocatoria!: number;
  idProvidencia!: number;

  selectedIndex: number | null = null;
  editMedidasMode: boolean = false;
  isEditProvidenciaActivate: boolean = false;
   denunciaId: number = 0;
   providenciaForm!: FormGroup;
   medidasEmergentesForm!: FormGroup;
   isBotonDesactivated: boolean = false;
   editMode: boolean = false;
  editMediasMode: boolean = false;
  medidasPorArticulo: ArticuloMedidas[] = [];
  medidasEmergentes: any[] = [];
  afectados: any[] = [{id: 0, nombres: ''}];
  avocatoriacargada: any;

    grupo: string = '';
     fechaHoraActual: string = new Date().toISOString().slice(0, 16);
     fechaFormateada: string = '';
     pdfSrc: SafeResourceUrl | null = null;
  //--- Configuración de tabs------//
  tabsConfig: any[] = [
    {
      id: 0,
      label: 'disposiciones'
    },
    {
      id: 1,
      label: 'Medidas'
    },
    {
      id: 2,
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

  constructor(private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private medidasService:MedidasService,
    private router: Router,
    private avocatoriaService: AvocatoriaService,
     private route: ActivatedRoute,
     private providenciaService: ProvidenciaService

  ) { }

  ngOnInit() {
    this.formularioProvidencia();
    this.formularioMedidasEmergentes();
     const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';

    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;
        this.providenciaForm.disable()
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
      this.LoadAfectados(this.denunciaId);
      this.loadIdAvocatoria(this.denunciaId);
    });

    this.fechaFormateada = this.formatearFecha();

    this.cargarListaDeMedidas();
    this.seleccionarMedida();
    this.getIdProvidencia(this.denunciaId);
    this.providenciaForm.valueChanges.subscribe((data) => {
      console.log('Cambios en el formulario de providencia:', data);
    });

  }

  formularioProvidencia(){
    this.providenciaForm = this.fb.group({
      idDenuncia: ['',Validators.required],
      codigoTramite:['',Validators.required],
      articulos: ['',Validators.required],
      suscrito: ['',Validators.required],
      nombreSuscrito: ['',Validators.required],
      cargoSuscrito: [],
      fechaSuscrito: ['',Validators.required],
      institucionSuscrito: [],
      disposiciones: ['',Validators.required],
    });

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

    loadIdAvocatoria(id:number){
      this.avocatoriaService.obtenerDenunciaParaAvocatoria(id).subscribe({
        next: (data) => {

          this.idAvocatoria=data.idAvocatoria;
           this.providenciaForm.patchValue({
          codigoTramite: data.codigoTramite,
          idDenuncia: data.id,

        });
          this.loadDatosAvocatoriaParaProvidencia(this.idAvocatoria);

        },
      })
    }
    providenciaEditMode(idDenuncia:number){
      this.providenciaService.getIdProvidencia(idDenuncia).subscribe({
        next: (data) => {
          this.idProvidencia = data.idProvidencia;

          // Una vez obtenido el ID, cargar los datos de la providencia
          this.providenciaService.getProvidenciaEditMode(this.idProvidencia).subscribe({
            next: (providenciaData) => {
              this.providenciaForm.patchValue({
                idDenuncia: providenciaData.idDenuncia,
                codigoTramite: providenciaData.codigoTramite,
                articulos: providenciaData.articulos,
                suscrito: providenciaData.suscrito,
                nombreSuscrito: providenciaData.nombreSuscrito,
                cargoSuscrito: providenciaData.cargoSuscrito,
                institucionSuscrito: providenciaData.institucionSuscrito,
                disposiciones: providenciaData.disposiciones
              });
            },
            error: (err) => {
              console.error('Error al cargar providencia:', err);
              toast.error('Error al cargar providencia', {
                duration: 3000,
                description: 'No se pudieron cargar los datos de la providencia.'
              });
            }
          });
        },
        error: (err) => {
          console.error('Error al obtener ID de providencia:', err);
          toast.error('Error al obtener ID de providencia', {
            duration: 3000,
            description: 'No se pudo obtener el ID de la providencia.'
          });
        }
      });
    }

    loadDatosAvocatoriaParaProvidencia(idAvocatoria:number){
    this.avocatoriaService.getAvocatoriaEditMode(idAvocatoria).subscribe((data) => {

      this.avocatoriacargada = data;

      if(this.editMode){
        this.providenciaEditMode(this.denunciaId);
      }else{
        this.providenciaForm.patchValue({
          disposiciones: this.avocatoriacargada.dispocisiones ?? this.avocatoriacargada.disposiciones ?? this.avocatoriacargada.disposicion ?? this.avocatoriacargada.dispocisiones ?? this.providenciaForm.get('dispocisiones')?.value,
          articulos: this.avocatoriacargada.articulo ?? this.avocatoriacargada.articulo ?? this.providenciaForm.get('articulo')?.value,
         })

      }




    })

    }

    getIdProvidencia(idDenuncia:number){
      this.providenciaService.getIdProvidencia(idDenuncia).subscribe(data=>{
        this.idProvidencia= data.idProvidencia;

      })

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
      //Carga de datos de vulneraciones identificadas
  loadMedidasEmergentes(id:number){
    if (!id) return;
  this.medidasService.getMedidasEmergentes(id)
    .subscribe((data) => {
      this.medidasEmergentes = data.afectado;
      console.log('Medidas Emergentes:', this.medidasEmergentes);
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
  agregarMedidasEmergentes() {
  const body = {
      ...this.medidasEmergentesForm.value,
    };
    this.medidasService.agregarMedidasEmergentes(body).subscribe({
      next: () => {

          this.loadMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value);
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
            this.loadMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value);
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
    this.medidasEmergentesForm.patchValue({
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
        this.editMedidasMode = false;


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
   medidaEmergentes(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
  console.log('Afectado seleccionado ID:', afectadoId);
  if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
  this.loadMedidasEmergentes(afectadoId);

  }
 //funcion para autocompletar el input de vulneraciones del formulario de vulneraciones identificadas
 seleccionarMedida() {
  this.medidasEmergentesForm.get('idMedida')!
    .valueChanges
    .subscribe((id: number | string) => {
      const numId = Number(id);
      // Busca el nombre en tu catálogo
      const encontrado = this.medidasPorArticulo
        .flatMap(articulo => articulo.medidas)
        .find(m => m.id === numId);


      this.medidasEmergentesForm.patchValue(
        { medida: encontrado?.medida ?? '' },
        { emitEvent: false }
      );
    });

}
 // Cancelar edición medidas
  cancelarEdicionMedidas(): void {
    this.editMedidasMode = false;
    this.medidasEmergentesForm.reset();
  }

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


   cambiarTab(tab: number) {
    this.currentTab = tab;
  }
regresar(): void {
  //pendiente cambiar ruta
    this.router.navigate([`/${this.grupo}/fases/`]);
  }
   handleActionButton(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if (this.editMode) {
          this.updateProvidencia();
        }else{
          this.submitProvidencia();
        }

        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }

  habilitarEdicion(){
    this.isEditProvidenciaActivate=true;
    this.providenciaForm.enable();
    this.medidasEmergentesForm.enable();
    this.isBotonDesactivated=false;
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;
  }



  updateProvidencia(){
    const body ={
        ...this.providenciaForm.value,

      }
      this.providenciaService.actualizarProvidencia(this.idProvidencia, body).subscribe({
        next: () => {
          toast.success('avocatoria Actualizada con Éxito', {
                    duration: 3000,
                  });
                  this.actionsConfig[1].disabled = true
        this.actionsConfig[2].disabled = false
        this.actionsConfig[0].disabled = false;
        this.isEditProvidenciaActivate=false;
        this.providenciaForm.disable();
        this.medidasEmergentesForm.disable();
        },
        error: (err) => {
          toast.error('Error al actualizar la avocatoria', {
            duration: 3000,
          });
        }

      })

  }

  submitProvidencia(){
    if (this.providenciaForm.invalid) {
        this.providenciaForm.markAllAsTouched();
        toast.error('Formulario inválido', {
          duration: 3000,
          description: 'Por Favor, Completa Todos los Campos Requeridos'
        });
        return;
      }
      this.actionsConfig[1].disabled = true
      const body ={
        ...this.providenciaForm.value,
      }
      this.providenciaService.postprovidencia(body).subscribe({
        next: (data) => {

         this.router.navigate(['../../editar/'+ this.denunciaId], { relativeTo: this.route });
      toast.success('providencia Guardada con Éxito', {
                duration: 3000,
              });

    },
    error(err) {

      toast.error('Error al guardar', {
        duration: 3000,
      description:`${err}`
      });

  }
      })



  }

  generarPdf(){
  this.actionsConfig[2].disabled = true
  this.providenciaService.crearpdfBlob(this.idProvidencia).subscribe((res: Blob) => {
    const url = URL.createObjectURL(res);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.actionsConfig[2].disabled = false
  });

  this.cambiarTab(2);
  }

  formatearFecha(): string {
    const ahora = new Date();
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const diaSemana = diasSemana[ahora.getDay()];
    const dia = ahora.getDate().toString().padStart(2, '0');
    const mes = meses[ahora.getMonth()];
    const año = ahora.getFullYear();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');

    return `<strong>${diaSemana}</strong> <strong>${dia}</strong> de <strong>${mes}</strong> del <strong>${año}</strong> a las <strong>${horas}h${minutos}</strong>`;
  }

}
export default Crear_providenciaComponent;
