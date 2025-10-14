import { Component, OnInit } from '@angular/core';
import { AvocatoriaService } from '../../services/avocatoria.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { QuillModule } from 'ngx-quill';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticuloMedidas, MedidasService } from '@nna/services/medidas.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-crearAvocatoria',
  templateUrl: './crearAvocatoria.component.html',
  imports: [CommonModule,
     ReactiveFormsModule,
      QuillModule,
      CardFormComponent,
      ButtonSubmitComponent,
      TablaEditComponent],
})
export class CrearAvocatoriaComponent implements OnInit {
  //variables formulario//----------
    avocatoriaForm!: FormGroup;
  medidasEmergentesForm!: FormGroup;
  //------------------------------------
  denunciaAvocatoria: any = null;
  medidasPorArticulo: ArticuloMedidas[] = [];
  afectados: any[] = [{id: 0, nombres: ''}];
  medidasIdenificadas: [] = [];
  // Guarda las medidas que el usuario eliminó localmente por afectado
  removedMedidasByAfectado: Map<number, Set<number>> = new Map();
  selectedIndex: number | null = null;
  denunciaId: number = 0;
  currentTab = 0;
  fechaHoraActual: Date = new Date();
   pdfSrc: SafeResourceUrl | null = null;
//variables para controlar los botones//
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;
  idAvocatoria!: number;
  //------------------------------------
  //
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


  constructor(private avocatoriaService: AvocatoriaService,
     private route: ActivatedRoute,
      private medidasService: MedidasService,
       private fb:FormBuilder,
      private router: Router,
    private sanitizer: DomSanitizer )
  {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];

      this.loadDenunciaParaAvocatoria(this.denunciaId)

      this.LoadAfectados(this.denunciaId);

    });
    this.cargarMedidas();
    this.formularioAvocatoria();
    this.formularioMedidasEmergentes();
    this.seleccionarMEdida();
    this.loadMedidasIDentificadas(this.medidasEmergentesForm.get('idAfectado')?.value);

    //----escucha cambios en los formularios para debug----//

    this.avocatoriaForm.valueChanges.subscribe((data) => {
        console.log('avocatoriaForm:', data);
        // Si el formulario cambia después de guardar, deshabilita PDF y edición
      if (!this.guardarDisabled) return; // Solo si ya se guardó
      this.pdfDisabled = true;
      this.editarDisabled = false;
    });
    this.medidasEmergentesForm.valueChanges.subscribe((data) => {
      console.log( data);
    });


  }

  //--------CREAcion de FORMULARIO DE AVOCATORIA-----------------//

  formularioAvocatoria() {
    this.avocatoriaForm=this.fb.group({
      codigoTramite: ['', Validators.required],
      idDenuncia: ['', Validators.required],
       fechaActual: [this.fechaHoraActual.toISOString().split('T')[0],
        Validators.required

      ],
       horaActual: [this.fechaHoraActual.toTimeString().split(':').slice(0, 2).join(':'),
        Validators.required

      ],

       dispocisiones: [` PRIMERO.-. Se le hace conocer a…………………………………………………….
lo que estipula
Art            del  Código de la Niñez y Adolescencia
Art            de la Ley de personas adultas mayores
Art            de la Ley de prevención y erradicación de la violencia
…………………………………………………………….……………………………………………………………………………………………………………………………………………………………………….
 SEGUNDO.- Se le hace conocer a ……………………………………….. lo que estipula
Art            del  Código de la Niñez y Adolescencia
Art            de la Ley de personas adultas mayores
Art            de la Ley de prevención y erradicación de la violencia

TERCERO.-
CUARTO.-`,
        Validators.required

      ],
      articulo: ['', Validators.required],
      mediasEmergentes: this.fb.array([], Validators.required),

    })

  }
  formularioMedidasEmergentes() {
   this.medidasEmergentesForm= this.fb.group({
      idAfectado: ['', Validators.required],
      idMedida: ['', Validators.required],
      medida: ['', Validators.required],
      periodo: ['', Validators.required],
      observaciones: ['', Validators.required],
    });
  }



  //-------getters de formulario-----------------//
  get medidas(): FormArray {
  return this.avocatoriaForm.get('mediasEmergentes') as FormArray;
}

  // Devuelve solo las medidas que pertenecen al afectado actualmente seleccionado
  get filteredMedidas(): any[] {
    const idAfectado = Number(this.medidasEmergentesForm.get('idAfectado')?.value);
    if (!idAfectado) return [];
    return (this.medidas.value || []).filter((m: any) => Number(m.idAfectado) === idAfectado);
  }



  //---------------llenar formulario-----------------//
   agregarAfectado(): void {
  if (this.medidasEmergentesForm.valid) {
    this.medidas.push(this.fb.group(this.medidasEmergentesForm.value));
    this.medidasEmergentesForm.reset(); // limpio el form para el siguiente
  } else {
    this.medidasEmergentesForm.markAllAsTouched(); // para que muestre errores
  }
}

seleccionarMEdida() {
  this.medidasEmergentesForm.get('idMedida')!
    .valueChanges
    .subscribe((id: number | string) => {
      const numId = Number(id);
      // Busca el nombre en tu catálogo
      const encontrado = this.medidasPorArticulo
        .flatMap(a => a.medidas)
        .find(m => m.id === numId);

      this.medidasEmergentesForm.patchValue(
        { medida: encontrado?.medida ?? '' },
        { emitEvent: false }
      );
    });

}

  //--------------carga de datos---------//

  loadDenunciaParaAvocatoria(id: number) {
    this.avocatoriaService.obtenerDenunciaParaAvocatoria(id).subscribe({
      next: (data) => {
        this.denunciaAvocatoria = data;

        this.avocatoriaForm.patchValue({
          codigoTramite: this.denunciaAvocatoria.codigoTramite,
          idDenuncia: this.denunciaAvocatoria.id,

        });


      },
      error: (err) => {
        console.error('Error al cargar la denuncia para avocatoria', err);
      }
    });
  }
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
   loadMedidasIDentificadas(id:number){

     if (!id) return;

  this.avocatoriaService.getMedidasIdentificadas(id)
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
          periodo:       [''],               // el usuario lo llenará
          observaciones: ['']                // el usuario lo llenará
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
  //-------otrso----/
  medidasEmergentes(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
  if (!afectadoId) return;
  // reset editor to avoid leftover selection from other afectado
  this.resetEditor();
  this.loadMedidasIDentificadas(afectadoId);

  }

   cambiarTab(tab: number) {
    this.currentTab = tab;
  }
  //-------guardar formualrio---------------//
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
  const fg = this.medidasEmergentesForm;
  if (fg.invalid) {
    fg.markAllAsTouched();
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
    this.medidasEmergentesForm.patchValue({
      idAfectado: fg.get('idAfectado')?.value,
      idMedida: fg.get('idMedida')?.value,
      medida: fg.get('medida')?.value,
      periodo: fg.get('periodo')?.value,
      observaciones: fg.get('observaciones')?.value,
    });
    this.selectedIndex = index;
  }



//---------cancelar-------------------//
cancelar(): void {
    this.router.navigate(['/nna/fases/'+ this.denunciaAvocatoria?.id]);
  }

  //--editar
  updateAvocatoria() {
  const body ={
    ...this.avocatoriaForm.value,


  }
  this.avocatoriaService.actualizarAvocatoria(this.idAvocatoria, body).subscribe({
    next: () => {
      toast.success('avocatoria Actualizada con Éxito', {
                duration: 3000,
              });
        this.pdfDisabled = false;
        this.editarDisabled = true;

    },
    error: (err) => {
      toast.error('Error al actualizar la avocatoria', {
        duration: 3000,
      });
    }

  })

}

//------------submit-----//
submitAvocatoria() {
  if (this.avocatoriaForm.invalid) {
    this.avocatoriaForm.markAllAsTouched();
    toast.error('Formulario inválido', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos'
    });
    return;
  }
  const body ={
    ...this.avocatoriaForm.value,

  }

  this.avocatoriaService.postAvocatoria(body).subscribe({
    next: (body) => {
      this.idAvocatoria = body.id;
      toast.success('avocatoria Guardada con Éxito', {
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
generarPdf(){

    this.avocatoriaService.crearpdfBlob(this.idAvocatoria).subscribe((res: Blob) => {
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab(3);
  }


}
export default CrearAvocatoriaComponent
