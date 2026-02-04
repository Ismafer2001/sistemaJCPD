import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InformesService } from '@nna/services/informes.service';
import { ButtonSubmitComponent } from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { InputsComponent } from '@shared/components/inputs/inputs.component';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import TablaNavigatorComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { QuillModule } from 'ngx-quill';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-formatoinforme',
  templateUrl: './formatoinforme.component.html',
  imports: [CardFormComponent,

     InputsComponent,
      CommonModule,
      ReactiveFormsModule,
       FormsModule,

      RouterLink,
      NavFormularioComponent,
      QuillModule]

})
export class FormatoinformeComponent implements OnInit {
   denunciaId = 0;
    editMode: boolean = false;
    grupo:string ='';
       fechaHoraActual = new Date();
  // Propiedades para el formulario de informe
  informeForm!: FormGroup;

  // Propiedades para navegación y tabs
  currentTab = 0;
   tabsConfig: any[] = [
    {
      id: 0,
      label: 'inicio'
    },

    {
      id: 1,
      label: 'pdf'
    }
  ];

  // Propiedades para el PDF
  pdfLoading = false;
  pdfError = false;
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

  // Propiedades para PDF
  pdfSrc: any;
  isEditInformeActivate: boolean=false;
  idInforme: any;
  informe: any ={};
  modo: any;

  // Configuración de Quill
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  };

  constructor(private route:ActivatedRoute,
     private router:Router,
    private fb:FormBuilder,
    private informesService: InformesService,
   private sanitizer: DomSanitizer){}

  ngOnInit() {
     const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';


    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];
      this.modo = params['modo'];
      this.idInforme = params['idinforme'];
      console.log('Denuncia ID en formato informe:', this.denunciaId);



    });
      this.inicializarFormulario();

    if (this.modo === 'editar') {
        this.editMode = true;
        this.informeForm.disable();
        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
         this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      }
    this.loadInformeData(this.denunciaId);
    this.informeForm.valueChanges.subscribe(value => {
      console.log(value);
    })

    console.log('Modo:', this.editMode);
  }

  // Función para inicializar el formulario
  inicializarFormulario(): void {
    this.informeForm = this.fb.group({
      nombre: ['', Validators.required],
      dirigidoA: ['', Validators.required],
      numeroOficio: ['', Validators.required],
      codigoTramite: ['', Validators.required],
      transcripcion: ['', Validators.required],
      idDenuncia: [this.denunciaId, Validators.required]
    });
  }

  loadInformeData(id: number): void {
    this.informesService.obtenerDatosParaInforme(id).subscribe(data => {
      this.informe = data;
      console.log(data);

      if (this.editMode) {
        this.loadInformeEditMOde(this.idInforme);


      }

      this.informeForm.patchValue({
        codigoTramite: data.codigoTramite,
      })

    })

  }
  loadInformeEditMOde(idInforme: number){
    this.informesService.obtenerInformePorId(idInforme).subscribe(data=>{
      console.log('Datos del informe:', data);

      // Cargar los datos del informe en el formulario
      this.informeForm.patchValue({
        nombre: data.nombre,
        dirigidoA: data.dirigidoA,
        numeroOficio: data.numeroOficio,
        codigoTramite: data.codigoTramite,
        transcripcion: data.transcripcion,
        idDenuncia: data.idDenuncia
      });
    });
  }

  // Función para cambiar tab (vacía)
 cambiarTab(tab: number) {
    this.currentTab = tab;
  }
  // Función para manejar acciones (vacía)
   handleAction(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if(this.isEditInformeActivate){
          this.updateInforme();
      }else{
        this.submitInforme();
      }


        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }

   habilitarEdicion(){
    this.isEditInformeActivate=true;
    this.informeForm.enable();
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;

  }


  submitInforme() {
     if (this.informeForm.invalid) {
        this.informeForm.markAllAsTouched();
        toast.error('Formulario inválido', {
          duration: 3000,
          description: 'Por Favor, Completa Todos los Campos Requeridos'
        });
        return;
      }
      const body ={
        ...this.informeForm.value,

      }
      this.informesService.crearInforme(body).subscribe({
       next: (body) => {
          this.idInforme = body.id;
          this.informeForm.patchValue({ id: this.idInforme })
          this.router.navigate(['../../'+ this.denunciaId+ '/editar',this.idInforme], { relativeTo: this.route });
          toast.success('Informe Guardado con Éxito', {
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
  updateInforme() {
     const body ={
        ...this.informeForm.value,

      }
      this.informesService.actualizarInforme(this.idInforme, body).subscribe({
        next: () => {
          toast.success('Informe Actualizado con Éxito', {
                    duration: 3000,
                  });
                  this.actionsConfig[1].disabled = true
        this.actionsConfig[2].disabled = false
        this.actionsConfig[0].disabled = false;
        this.isEditInformeActivate=false;
        this.informeForm.disable();

        },
        error: (err) => {
          toast.error('Error al actualizar la avocatoria', {
            duration: 3000,
          });
        }

      })
  }
  generarPdf(){
    this.actionsConfig[2].disabled = true
    this.pdfLoading = true;
    this.pdfError = false;
    this.cambiarTab(1); // Cambiar al tab PDF inmediatamente para mostrar el loader

    this.informesService.crearpdfBlob(this.idInforme).subscribe({
      next: (res: Blob) => {
        const url = URL.createObjectURL(res);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.pdfLoading = false;
        this.actionsConfig[2].disabled = false;
      },
      error: (error) => {
        console.error('Error al generar PDF:', error);
        this.pdfLoading = false;
        this.pdfError = true;
        this.actionsConfig[2].disabled = false;
        toast.error('Error', {
          description: 'Error al generar el PDF. Inténtalo de nuevo.',
          duration: 3000,
        });
      }
    });
  }

  retryGenerarPdf() {
    this.generarPdf();
  }

}
export default FormatoinformeComponent;
