import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CitacionesService } from '@nna/services/citaciones.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { InputsComponent } from '@shared/components/inputs/inputs.component';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-formato-citacion',
  templateUrl: './formato-citacion.component.html',
  imports: [CardFormComponent,
    NavFormularioComponent,
    RouterLink,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ]


})
export class FormatoCitacionComponent implements OnInit {
   //--- Configuración de tabs------//
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
   denunciaId = 0;
   citacionForm!: FormGroup;
   fechaHoraActual: Date = new Date();
   pdfSrc: SafeResourceUrl | null = null;
   citar: any = { };
   datosPersonas: any = {};
  citacionCargada: any = null;
  isEditCitacionActivate: boolean =false;
  idCitacion!: number;
  tipoInvolucrado: string ='';
  idInvolucrado: number =0;
  isCitado: boolean = false;
  estadoCitado: string ='';

  // Propiedades de loading
  initialLoading: boolean = false;
  pdfLoading: boolean = false;
  pdfError: string | null = null;
  loading: boolean = false; // Loader principal para guardar/actualizar
  loadingMessage: string = ''; // Mensaje del loader principal

  constructor(private CitacionesService:CitacionesService,
     private route:ActivatedRoute,
     private router:Router,
    private fb:FormBuilder,
    private sanitizer: DomSanitizer ) {}

  ngOnInit() {
    this.initialLoading = true;
    this.formularioFormatoCitacion();
    // Para parámetros de matriz (;nombres=valor;estado=valor;parte=valor)
    this.route.paramMap.subscribe(paramMap => {

      // Obtener parámetros específicos
      this.tipoInvolucrado = paramMap.get('parte') || '';
       this.estadoCitado = paramMap.get('estado') || '';
      this.idInvolucrado = Number(paramMap.get('idUsuario'));
      this.idCitacion = Number(paramMap.get('idformulario'));

      if (this.estadoCitado === 'Citado') {
        this.isCitado = true;
        this.citacionForm.disable()




        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
         this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      }


      this.citacionForm.patchValue({
        parte: this.tipoInvolucrado,
        idUsuario: this.idInvolucrado,


        });

    });


    // Obtener parámetros de la URL (ej: /ruta/:id)
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      this.citacionForm.patchValue({
        idDenuncia: this.denunciaId


        });


    });
    this.loadDatosCitados(this.denunciaId, this.tipoInvolucrado,this.idInvolucrado,this.idCitacion);

    this.citacionForm.valueChanges.subscribe((n) => {
      console.log('Valor del formulario de citación:', n);
    })
  }

  private checkInitialLoadingComplete(): void {
    // Verificar si todos los datos necesarios están cargados
    if (this.citar && this.datosPersonas && this.citacionForm.get('codigoTramite')?.value) {
      this.initialLoading = false;
    }
  }


  cambiarTab(valor: number) {
  this.currentTab = valor;


}

formularioFormatoCitacion(){
    this.citacionForm = this.fb.group({
      idDenuncia:[this.denunciaId],
      codigoTramite:[],
      diriguidoA:['', Validators.required],
      fecha:['', Validators.required],
      hora:['', Validators.required],
      direccion:['', Validators.required],
      local:['', Validators.required],
      idUsuario: [''],
      parte:['', Validators.required],
      fechaCreacion:[this.fechaHoraActual.toISOString().split('T')[0]],
      razon:[''],

      id:[]




    })
  }

  loadDatosCitados(id:number,tipoInvolucrado?:string,idInvolucrado?:number,idCitacion?:number){

    console.log('Cargando datos de citación con:', id, tipoInvolucrado, idInvolucrado, idCitacion);

    this.CitacionesService.getcitacioenesDTO(id,tipoInvolucrado,idInvolucrado,idCitacion).subscribe({
      next: (data) => {
        this.citar=data;
        this.datosPersonas=this.citar.datosPersona;
        this.idCitacion=this.citar.id;
        console.log('Citacion cargado:', this.citar);
        console.log('Datos de la persona:', this.datosPersonas);
        console.log('ID Citacion:', this.citar.id);
        if (this.isCitado) {
          this.loadCitadosEditMode(this.citar.id);
        } else {
          this.citacionForm.patchValue({
            codigoTramite: this.citar.codigoTramite,
            diriguidoA: this.datosPersonas.nombres + ' ' + this.datosPersonas.apellidos,
          });
          this.checkInitialLoadingComplete();
        }
      },
      error: (err) => {
        console.error('Error al cargar datos de citación:', err);
        this.initialLoading = false;
      }
    })
  }

  loadCitadosEditMode(id:number){
    this.CitacionesService.getCitacionEditMode(id).subscribe({
      next: (data) => {
        this.citacionCargada=data;
        console.log('Citacion cargada para edición:', this.citacionCargada);
        this.citacionForm.patchValue({
          codigoTramite: this.citacionCargada.codigoTramite,
          diriguidoA: this.citacionCargada.diriguidoA,
          idUsuario: this.citacionCargada.idUsuario,
          parte: this.citacionCargada.parte,
          direccion: this.citacionCargada.direccion,
          fecha: this.citacionCargada.fecha ? this.citacionCargada.fecha.split('T')[0] : '',
          hora: this.citacionCargada.hora,
          local: this.citacionCargada.local,
          razon: this.citacionCargada.razon,
          id: this.citacionCargada.id
        });
        this.checkInitialLoadingComplete();
      },
      error: (err) => {
        console.error('Error al cargar citación en modo edición:', err);
        this.initialLoading = false;
      }
    })
  }



   handleAction(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if(this.isEditCitacionActivate){
          this.updateCitacion();
      }else{
        this.submitCitacion();
      }


        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }

   habilitarEdicion(){
    this.isEditCitacionActivate=true;
    this.citacionForm.enable();
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;

  }

     //--editar
  updateCitacion() {
  // Activar loader
  this.loading = true;
  this.loadingMessage = 'Actualizando citación...';

  const body ={
    ...this.citacionForm.value,


  }
  this.CitacionesService.actualizarCitacion(this.idCitacion, body).subscribe({
      next: () => {
        this.loading = false; // Desactivar loader
        toast.success('Citacion Actualizada con Éxito', {
                  duration: 3000,
                });
                this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditCitacionActivate=false;
    this.citacionForm.disable();



      },
      error: (err) => {
        this.loading = false; // Desactivar loader
        toast.error('Error al actualizar la citacion', {
          duration: 3000,
        });
      }

    })
}

submitCitacion() {
   if (this.citacionForm.invalid) {
      this.citacionForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        duration: 3000,
        description: 'Por Favor, Completa Todos los Campos Requeridos'
      });
      return;
    }

  // Activar loader
  this.loading = true;
  this.loadingMessage = 'Guardando citación...';

  const body = {
    ...this.citacionForm.value
  };
  this.actionsConfig[1].disabled = true

  this.CitacionesService.postCitar(body).subscribe({
    next: (response) => {
      this.loading = false; // Desactivar loader
      this.idCitacion = response.id;
      this.citacionForm.patchValue({ id: this.idCitacion });
      this.router.navigate(['../../'+ this.denunciaId+ '/formulario', {
        idUsuario: this.idInvolucrado,
        estado: 'Citado',
        parte: response.parte,
        idformulario: this.idCitacion
      }], { relativeTo: this.route });
      toast.success('Citacion Guardada con Éxito', {
        duration: 3000
      });
    },
    error: (err) => {
      this.loading = false; // Desactivar loader
      toast.error('Error al guardar', {
        duration: 3000,
        description: `${err}`
      });
    }
  });
}

  generarPdf(){
    this.pdfLoading = true;
    this.pdfError = null;
    this.pdfSrc = null;

    this.CitacionesService.crearpdfBlob(this.idCitacion).subscribe({
      next: (res: Blob) => {
        if (res && res.size > 0) {
          const url = URL.createObjectURL(res);
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.pdfLoading = false;
        } else {
          this.pdfError = 'No se pudo generar el PDF. No hay datos suficientes.';
          this.pdfLoading = false;
        }
      },
      error: (err) => {
        console.error('Error al generar PDF:', err);
        this.pdfError = 'Error al generar el PDF. Por favor intente nuevamente.';
        this.pdfLoading = false;
      }
    });
    this.cambiarTab(1);
  }

}
export default FormatoCitacionComponent;
