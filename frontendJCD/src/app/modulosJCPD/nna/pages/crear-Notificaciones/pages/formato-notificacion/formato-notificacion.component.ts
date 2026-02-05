import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificacionService } from '@nna/services/notificacion.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import { toast } from 'ngx-sonner';
import InputsComponent from "@shared/components/inputs/inputs.component";


@Component({
  selector: 'app-formato-notificacion',
  templateUrl: './formato-notificacion.component.html',
  imports: [CardFormComponent,
    NavFormularioComponent,
    RouterLink,
    FormsModule,
    CommonModule,
    ReactiveFormsModule, InputsComponent]

})
export class FormatoNotificacionComponent implements OnInit {
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
   notificacionForm!: FormGroup;
   fechaHoraActual: Date = new Date();
   pdfSrc: SafeResourceUrl | null = null;

   // Loading states
   initialLoading = true;
   loading = false;
   pdfLoading = false;
   pdfError: string | null = null;

   notificar: any = { };
   datosPersonas: any = {};
  notificacionCargada: any = null;
  isEditNotificacionActivate: boolean =false;
  idNotificacion!: number;
  tipoInvolucrado: string ='';
  idInvolucrado: number =0;
  isNotificado: boolean = false;
  estadoNotificado: string ='';

  constructor(private notificacionServices:NotificacionService,
     private route:ActivatedRoute,
     private router:Router,
    private fb:FormBuilder,
    private sanitizer: DomSanitizer ) {}

  ngOnInit() {
    this.initialLoading = true;
    this.formularioFormatoNotificacion();

    // Para parámetros de matriz (;nombres=valor;estado=valor;parte=valor)
    this.route.paramMap.subscribe(paramMap => {

      // Obtener parámetros específicos
      this.tipoInvolucrado = paramMap.get('parte') || '';
       this.estadoNotificado = paramMap.get('estado') || '';
      this.idInvolucrado = Number(paramMap.get('idUsuario'));
      this.idNotificacion = Number(paramMap.get('idformulario'));

      if (this.estadoNotificado === 'Notificado') {
        this.isNotificado = true;
        this.notificacionForm.disable()




        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
         this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      }


      this.notificacionForm.patchValue({
        parte: this.tipoInvolucrado,
        idUsuario: this.idInvolucrado,


        });

    });


    // Obtener parámetros de la URL (ej: /ruta/:id)
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      console.log('ID Denuncia en notificación params:', this.denunciaId);
      this.notificacionForm.patchValue({
        idDenuncia: this.denunciaId

        });


    });

    console.log('ID Denuncia en notificación:', this.tipoInvolucrado, this.idInvolucrado, this.denunciaId);
    console.log('ID Notificación en notificación:', this.idNotificacion);

    this.loadDatosNotificados(this.denunciaId, this.tipoInvolucrado,this.idInvolucrado,this.idNotificacion);

    this.notificacionForm.valueChanges.subscribe((n) => {
      console.log('Valor del formulario de notificación:', n);
    })

  }

   formularioFormatoNotificacion(){
    this.notificacionForm = this.fb.group({
      codigoTramite:['',Validators.required],
      idDenuncia:[this.denunciaId],
      diriguidoA:['', Validators.required],
      idUsuario: [, Validators.required],
      parte:['',Validators.required],
      direccion:[, Validators.required],
      fecha:[this.fechaHoraActual.toISOString().split('T')[0]],
      numOficio:[, Validators.required],
      id:[]




    })
  }

  // Método para verificar si la carga inicial está completa
  private checkInitialLoadingComplete(): void {
    if (this.notificar && this.datosPersonas) {
      this.initialLoading = false;
    }
  }

   loadNotificadosEditMode(id:number){
    this.notificacionServices.getNotificacionEditMode(id).subscribe(data=>{
      this.notificacionCargada=data;
      console.log('Notificación cargada para edición:', this.notificacionCargada);
       this.notificacionForm.patchValue({
          codigoTramite: this.notificacionCargada.codigoTramite,
          diriguidoA: this.notificacionCargada.diriguidoA,
          idUsuario: this.notificacionCargada.idUsuario,
          parte: this.notificacionCargada.parte,
          direccion: this.notificacionCargada.direccion,

          numOficio: this.notificacionCargada.numOficio,
          id: this.notificacionCargada.id
        });


    })
  }

  loadDatosNotificados(id:number,tipoInvolucrado?:string,idInvolucrado?:number,idNotificacion?:number){

    console.log('Cargando datos de notificación con:', id, tipoInvolucrado, idInvolucrado, idNotificacion);

    this.notificacionServices.getnotificacionDTO(id,tipoInvolucrado,idInvolucrado,idNotificacion).subscribe({
      next: (data) => {
        this.notificar=data;
        this.datosPersonas=this.notificar.datosPersona;
        this.idNotificacion=this.notificar.id;
        console.log('Notificar cargado:', this.notificar);
        console.log('Datos de la persona:', this.datosPersonas);
        console.log('ID Notificación:', this.notificar.id);
        if (this.isNotificado) {
          this.loadNotificadosEditMode(this.notificar.id);

        }
         this.notificacionForm.patchValue({
            codigoTramite: this.notificar.codigoTramite,
            diriguidoA: this.datosPersonas.nombres + ' ' + this.datosPersonas.apellidos,


          });

        this.checkInitialLoadingComplete();
      },
      error: (err) => {
        console.error('Error al cargar datos de notificación:', err);
        this.checkInitialLoadingComplete();
      }
    })
  }

    cambiarTab(tab: number) {
    this.currentTab = tab;
  }

   handleAction(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if(this.isEditNotificacionActivate){
          this.updateNotificacion();
      }else{
        this.submitNotificacion();
      }


        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
   habilitarEdicion(){
    this.isEditNotificacionActivate=true;
    this.notificacionForm.enable();
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;

  }


    //--editar
  updateNotificacion() {
  const body ={
    ...this.notificacionForm.value,


  }

  this.loading = true;

  this.notificacionServices.actualizarNotificacion(this.idNotificacion, body).subscribe({
      next: () => {
        this.loading = false;
        toast.success('Notificación Actualizada con Éxito', {
                  duration: 3000,
                });
                this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditNotificacionActivate=false;
    this.notificacionForm.disable();



      },
      error: (err) => {
        this.loading = false;
        toast.error('Error al actualizar la notificación', {
          duration: 3000,
        });
      }

    })
}


submitNotificacion() {
  if (this.notificacionForm.invalid) {
    this.notificacionForm.markAllAsTouched();
    toast.error('Formulario inválido', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
  const body ={
    ...this.notificacionForm.value,

  }

  this.loading = true;

  this.notificacionServices.postNotificar(body).subscribe({
   next: (body) => {
      this.loading = false;
      this.idNotificacion = body.id;
      this.notificacionForm.patchValue({ id: this.idNotificacion })
      this.router.navigate(['../../'+ this.denunciaId+ '/formulario', {idUsuario: this.idInvolucrado, estado: 'Notificado', parte: body.parte, idformulario: this.idNotificacion}], { relativeTo: this.route });
      toast.success('Notificación Guardada con Éxito', {
                duration: 3000,
              });


    },
    error: (err) => {
      this.loading = false;
      toast.error('Error al guardar', {
        duration: 3000,
      description:`${err}`
      });

  }

  })

}


  generarPdf(){
    this.pdfLoading = true;
    this.pdfError = null;
    this.pdfSrc = null;

    this.notificacionServices.crearpdfBlob(this.idNotificacion).subscribe({
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
export default FormatoNotificacionComponent;
