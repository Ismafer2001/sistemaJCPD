import { Component, OnInit } from '@angular/core';
import { AvocatoriaService } from '../../services/avocatoria.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import TablaComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { QuillModule } from 'ngx-quill';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticuloMedidas, MedidasService } from '@nna/services/medidas.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

@Component({
  selector: 'app-crearAvocatoria',
  templateUrl: './crearAvocatoria.component.html',
  imports: [CommonModule, ReactiveFormsModule, QuillModule,CardFormComponent,ButtonSubmitComponent],
})
export class CrearAvocatoriaComponent implements OnInit {

  denunciaAvocatoria: any = null;
  medidasPorArticulo: ArticuloMedidas[] = [];
  afectados: any[] = [{id: 0, nombres: ''}];
  medidasIdenificadas: [] = [];
  selectedIndex: number | null = null;
  denunciaId: number = 0;
  currentTab = 0;
  fechaHoraActual: Date = new Date();
  avocatoriaForm!: FormGroup;
  medidasEmergentesForm!: FormGroup;
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
      private router: Router )
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
      mediasEmergentes: this.fb.array([]),

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


  //-------otrso----//




  medidasEmergentes(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
    if (!afectadoId) return;
    this.loadMedidasIDentificadas(afectadoId);

  }

   cambiarTab(tab: number) {
    this.currentTab = tab;
  }


  //-------guardar formualrio---------------//
  isAgregada(idMedida: number): boolean {
  return (this.medidas.value as Array<{ idMedida: number }>)
    .some(d => d.idMedida === idMedida);
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
    // Crear: valida duplicados por idMedida
    if (this.isAgregada(Number(v.idMedida))) {
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

//---------cancelar-------------------//
cancelar(): void {
    this.router.navigate(['/nna/fases/'+ this.denunciaAvocatoria?.id]);
  }

//------------submit-----//
submitAvocatoria() {
  const body ={
    ...this.avocatoriaForm.value,


  }
  this.avocatoriaService.postAvocatoria(body).subscribe({
    next: () => {

            this.router.navigate(['/nna']);
          }

  })

}


}
export default CrearAvocatoriaComponent
