import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CierreCasoService } from '@nna/services/cierreCaso.service';
import { QuillModule } from 'ngx-quill';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { toast } from 'ngx-sonner';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InputsComponent } from '@shared/components/inputs/inputs.component';

@Component({
  selector: 'app-cierre_caso',
  templateUrl: './cierre_caso.component.html',
  imports: [CommonModule,
     CardFormComponent,
     ReactiveFormsModule,
     TablaEditComponent,
    QuillModule,
  ButtonSubmitComponent,
NavFormularioComponent,
InputsComponent,
RouterLink]

})
export class Cierre_casoComponent implements OnInit {
   //--- Configuración de tabs------//
  tabsConfig: any[] = [
    {
      id: 0,
      label: 'Informes presentados'
    },
    {
      id: 1,
      label: 'Informes citados'
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
  grupo: string = '';
  isEditCierreCasoActivate:boolean=false;
  idCierreCaso!:number;
    denunciaId!:number;
    editMode: boolean = false;
    modoEdicionInforme: boolean = false;
    indexInformeEditando: number | null = null;

    CierreCasoForm!: FormGroup;
    informesPresentadosForm!: FormGroup;
    DatosCierreCaso:any;

    // Propiedades para la tabla
    informesPresentadosData: any[] = [];
    encabezadosInformes = ['Informe', 'Técnico/Institución', 'Fecha', 'Lugar', 'Persona Evaluada'];
    columnasInformes = ['informe', 'nombreTecnico', 'fecha', 'lugar', 'personaEvaluada'];
    pdfSrc: SafeResourceUrl | null = null;

    // Estado de loading para PDF
    pdfLoading: boolean = false;
    pdfError: boolean = false;
    loading: boolean = false; // Loader principal para guardar/actualizar
    loadingMessage: string = ''; // Mensaje del loader principal

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
    private route: ActivatedRoute,
    private cierreCasoService: CierreCasoService,
    private sanitizer: DomSanitizer,
     private router: Router,
  ) { }

  ngOnInit() {

    this.formularioInformesPresentados();
   const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;




        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios
      }else{
         this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      }
      this.loadDatosCierreCaso(this.denunciaId)
      this.formularioCierreCaso();



    });



  }

  //FORMULARIO CIEERRE CASO//

  formularioCierreCaso() {
    this.CierreCasoForm = this.fb.group({
       idDenuncia: [this.denunciaId, Validators.required],
        codigoTramite:[],
        conclusion:['', Validators.required],
        secretariaAuxiliar:['', Validators.required],
        informesPresentados: this.fb.array([]),

    });
  }
  formularioInformesPresentados() {
    this.informesPresentadosForm = this.fb.group({
      id: [''], // Campo para ID en modo edición
      informe:['', Validators.required],
      nombreTecnico:['', Validators.required],
      lugar:['', Validators.required],
      personaEvaluada:['', Validators.required],
      fecha:['', Validators.required],
    });

  }

  loadDatosCierreCaso(denunciaId: number){
    this.cierreCasoService.obtenerDatosParaCierreCaso(denunciaId).subscribe(data=>{


      this.DatosCierreCaso=data;

      if(this.editMode){
        this.idCierreCaso=data.id;

          this.cierreCasoEditMode(this.idCierreCaso);

        }
      this.CierreCasoForm.patchValue({
        idDenuncia: this.denunciaId,
        codigoTramite: data.codigoTramiteDenuncia,
        conclusion: `<p>De&nbsp;los&nbsp;informes&nbsp;citados&nbsp;y&nbsp;revisando&nbsp;el&nbsp;
        expediente,&nbsp;la&nbsp;Junta&nbsp;considera&nbsp;que:&nbsp;las&nbsp;disposiciones&nbsp;
        número&nbsp;………………………………………………………….&nbsp;De&nbsp;la&nbsp;<strong>Resolución&nbsp;
        ${ data.codigoTramiteDenuncia}</strong>&nbsp;han&nbsp;sido&nbsp;
        cumplidos&nbsp;…………………………………………&nbsp;………………………………………..&nbsp;que&nbsp;el/la&nbsp;
        afectada……………….ha&nbsp;superado&nbsp;la&nbsp;situación&nbsp;de&nbsp;
        vulneración/riesgo………………………&nbsp;</p><p>por&nbsp;lo&nbsp;que&nbsp;la&nbsp;Junta,&nbsp;
        DISPONE:</p><p>&nbsp;1).-&nbsp;Revocar&nbsp;todas&nbsp;las&nbsp;Medidas&nbsp;de&nbsp;
        Protección&nbsp;desde&nbsp;la&nbsp;Avocatoria&nbsp;de&nbsp;Conocimiento&nbsp;hasta&nbsp;
        la&nbsp;presente&nbsp;fecha&nbsp;por&nbsp;considerarse&nbsp;cumplidas;&nbsp;y&nbsp;se&nbsp;
        ordena&nbsp;el&nbsp;archivo&nbsp;provisional&nbsp;del&nbsp;expediente.&nbsp;</p>
        <p>3).-&nbsp;La&nbsp;Junta&nbsp;se&nbsp;reserva&nbsp;el&nbsp;derecho&nbsp;de&nbsp;
        reabrir&nbsp;el&nbsp;caso,&nbsp;si&nbsp;se&nbsp;presentara&nbsp;nuevos&nbsp;hechos&nbsp;
        en&nbsp;relación&nbsp;al&nbsp;mismo.</p>`
      });
    });
  }
  cierreCasoEditMode(idCierreCaso: number){
    this.cierreCasoService.getCierreCasoEditMode(idCierreCaso).subscribe(data=>{


      // Llenar el formulario principal con los datos del cierreCaso
      if (data.cierreCaso) {
        this.CierreCasoForm.patchValue({
          idDenuncia: data.cierreCaso.idDenuncia,
          codigoTramite: data.cierreCaso.codigoTramite,
          conclusion: data.cierreCaso.conclusion,
          secretariaAuxiliar: data.cierreCaso.secretariaAuxiliar
        });
      }

      // Llenar el FormArray y la tabla con los informes presentados
      if (data.informesPresentados && data.informesPresentados.length > 0) {
        // Limpiar el FormArray actual
        while (this.informesPresentadosArray.length !== 0) {
          this.informesPresentadosArray.removeAt(0);
        }

        // Limpiar la tabla
        this.informesPresentadosData = [];

        // Agregar cada informe al FormArray y a la tabla
        data.informesPresentados.forEach((informe: any) => {
          // Crear FormGroup para cada informe
          const informeFormGroup = this.fb.group({
            id: [informe.id],
            informe: [informe.informe],
            nombreTecnico: [informe.nombreTecnico],
            fecha: [informe.fecha],
            lugar: [informe.lugar],
            personaEvaluada: [informe.personaEvaluada]
          });

          // Agregar al FormArray
          this.informesPresentadosArray.push(informeFormGroup);

          // Agregar a los datos de la tabla
          this.informesPresentadosData.push({
            id: informe.id,
            informe: informe.informe,
            nombreTecnico: informe.nombreTecnico,
            fecha: informe.fecha,
            lugar: informe.lugar,
            personaEvaluada: informe.personaEvaluada
          });
        });


      }
    })

  }

  // Getter para el FormArray
  get informesPresentadosArray(): FormArray {
    return this.CierreCasoForm.get('informesPresentados') as FormArray;
  }

  // Método para agregar o actualizar informe
  agregarInforme() {
    if (this.modoEdicionInforme && this.indexInformeEditando !== null) {
      this.actualizarInforme();
    } else {
      if (this.informesPresentadosForm.valid) {
        const informeData = this.informesPresentadosForm.value;

        // Crear FormGroup para el informe
        const informeFormGroup = this.fb.group({
          id: [informeData.id || null],
          informe: [informeData.informe],
          nombreTecnico: [informeData.nombreTecnico],
          fecha: [informeData.fecha],
          lugar: [informeData.lugar],
          personaEvaluada: [informeData.personaEvaluada]
        });

        // Agregar al FormArray
        this.informesPresentadosArray.push(informeFormGroup);

        // Agregar a los datos de la tabla (sin el ID si es null para nuevos registros)
        const dataToAdd = {...informeData};
        if (!dataToAdd.id) {
          delete dataToAdd.id;
        }
        this.informesPresentadosData.push(dataToAdd);

        // Limpiar el formulario
        this.informesPresentadosForm.reset();


      } else {
        console.log('Formulario inválido');
        // Marcar todos los campos como touched para mostrar errores
        Object.keys(this.informesPresentadosForm.controls).forEach(key => {
          this.informesPresentadosForm.get(key)?.markAsTouched();
        });
      }
    }
  }

  // Método para eliminar informe
  eliminarInforme(index: number) {
    if (index < 0 || index >= this.informesPresentadosData.length) {
      console.error('Índice de informe inválido para eliminar');
      return;
    }

    this.informesPresentadosArray.removeAt(index);
    this.informesPresentadosData.splice(index, 1);

    // Si estamos eliminando el elemento que se está editando, cancelar edición
    if (this.indexInformeEditando === index) {
      this.cancelarEdicionInforme();
    }


  }

  // Método para editar informe
  editarInforme(indexOrData: number | any): void {
    let informeData: any;
    let index: number;

    // Determinar si recibimos un índice o un objeto de datos
    if (typeof indexOrData === 'number') {
      // Caso 1: Recibimos un índice numérico
      index = indexOrData;
      if (index < 0 || index >= this.informesPresentadosData.length) {
        console.error('Índice de informe inválido');
        return;
      }
      informeData = this.informesPresentadosData[index];
    } else {
      // Caso 2: Recibimos un objeto de datos (desde tablaEdit)
      informeData = indexOrData;

      // Buscar el índice correspondiente en el array
      index = this.informesPresentadosData.findIndex(item => {
        return item.informe === informeData.informe &&
               item.nombreTecnico === informeData.nombreTecnico &&
               item.fecha === informeData.fecha;
      });

      if (index === -1) {
        console.error('No se encontró el informe en los datos');
        return;
      }
    }



    // Verificar que informeData existe
    if (!informeData) {
      console.error('No se encontraron datos para editar');
      return;
    }

    // Cargar todos los datos en el formulario
    this.informesPresentadosForm.patchValue({
      id: informeData.id || null,
      informe: informeData.informe || '',
      nombreTecnico: informeData.nombreTecnico || '',
      lugar: informeData.lugar || '',
      personaEvaluada: informeData.personaEvaluada || '',
      fecha: informeData.fecha || ''
    });

    this.modoEdicionInforme = true;
    this.indexInformeEditando = index;

    
  }

  // Método para actualizar informe
  actualizarInforme(): void {
    if (this.informesPresentadosForm.valid && this.indexInformeEditando !== null) {
      const informeData = this.informesPresentadosForm.value;
      const originalData = this.informesPresentadosData[this.indexInformeEditando];

      // Verificar que originalData existe
      if (!originalData) {
        console.error('No se encontraron datos originales para actualizar');
        return;
      }

      // Preservar el ID original si existe
      const updatedData = {
        ...informeData,
        id: (originalData && originalData.id) || (informeData && informeData.id) || null
      };

      // Actualizar en el FormArray
      const informeFormGroup = this.informesPresentadosArray.at(this.indexInformeEditando);
      if (informeFormGroup) {
        informeFormGroup.patchValue(updatedData);
      }

      // Actualizar en los datos de la tabla
      this.informesPresentadosData[this.indexInformeEditando] = {...updatedData};

      // Resetear modo de edición
      this.cancelarEdicionInforme();

      toast.success('Informe actualizado con éxito', { duration: 3000 });
    }
  }

  // Método para cancelar edición
  cancelarEdicionInforme(): void {
    this.modoEdicionInforme = false;
    this.indexInformeEditando = null;
    this.informesPresentadosForm.reset();
  }

  //---------------------------OTROS-------------------//
   cambiarTab(tab: number) {
    this.currentTab = tab;
  }
     handleActionButton(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if (this.editMode) {
          this.updateCierreCaso();
        }else{
          this.submitCierreCaso();
        }

        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
  habilitarEdicion(){
    this.isEditCierreCasoActivate=true;
    this.CierreCasoForm.enable();


    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;
  }

  // Método para obtener el estado completo del formulario
  obtenerDatosCompletos() {
    return {
      datosPrincipales: this.CierreCasoForm.value,
      informesPresentados: this.informesPresentadosArray.value
    };
  }

  submitCierreCaso() {
     if (this.CierreCasoForm.invalid) {
        this.CierreCasoForm.markAllAsTouched();
        toast.error('Formulario inválido', {
          duration: 3000,
          description: 'Por Favor, Completa Todos los Campos Requeridos'
        });
        return;
      }

      // Activar loader
      this.loading = true;
      this.loadingMessage = 'Guardando cierre de caso...';

      this.actionsConfig[1].disabled = true

      const body ={
    ...this.CierreCasoForm.value,

  }
  this.cierreCasoService.crearCierreCaso(body).subscribe({
    next: (body) => {

          this.loading = false; // Desactivar loader
          console.log('ID de avocatoria guardada:', body)
          this.router.navigate(['../../editar/'+ this.denunciaId], { relativeTo: this.route });

          toast.success('cierre de caso Guardada con Éxito', {
                    duration: 3000,
                  });


        },
        error: (err) => {
          this.loading = false; // Desactivar loader
          toast.error('Error al guardar', {
            duration: 3000,
          description:`${err}`
          });

      }

  });

  }
  updateCierreCaso() {

    // Activar loader
    this.loading = true;
    this.loadingMessage = 'Actualizando cierre de caso...';

    const body ={
    ...this.CierreCasoForm.value,

  }
  this.cierreCasoService.actualizarCierreCaso(this.idCierreCaso, body).subscribe({
    next: () => {
      this.loading = false; // Desactivar loader
      toast.success('cierre de Caso Actualizada con Éxito', {
                duration: 3000,
              });
              this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditCierreCasoActivate=false;
    this.CierreCasoForm.disable();
    this.informesPresentadosForm.disable();
    },
    error: (err) => {
      this.loading = false; // Desactivar loader
      toast.error('Error al actualizar la avocatoria', {
        duration: 3000,
      });
    }

  })


  }

  generarPdf(){
    this.pdfLoading = true;
    this.pdfError = false;
    this.actionsConfig[2].disabled = true;

    this.cierreCasoService.crearpdfBlob(this.idCierreCaso).subscribe({
      next: (res: Blob) => {
        const url = URL.createObjectURL(res);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.pdfLoading = false;
        this.actionsConfig[2].disabled = false;
        this.cambiarTab(2);
      },
      error: (err: any) => {
        console.error('Error al generar PDF:', err);
        this.pdfLoading = false;
        this.pdfError = true;
        this.actionsConfig[2].disabled = false;
        toast.error('Error al generar PDF', {
          duration: 4000,
          description: 'No se pudo generar el PDF. Intenta nuevamente.'
        });
      }
    });
  }

  retryGenerarPdf(): void {
    this.generarPdf();
  }


}
export default Cierre_casoComponent;
