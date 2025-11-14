import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CierreCasoService } from '@nna/services/cierreCaso.service';
import { QuillModule } from 'ngx-quill';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { toast } from 'ngx-sonner';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

@Component({
  selector: 'app-cierre_caso',
  templateUrl: './cierre_caso.component.html',
  imports: [CommonModule,
     CardFormComponent,
     ReactiveFormsModule,
     TablaEditComponent,
    QuillModule,
  ButtonSubmitComponent]

})
export class Cierre_casoComponent implements OnInit {
   currentTab:string ='0'

    denunciaId!:number;

    CierreCasoForm!: FormGroup;
    informesPresentadosForm!: FormGroup;
    DatosCierreCaso:any;

    // Propiedades para la tabla
    informesPresentadosData: any[] = [];
    encabezadosInformes = ['Informe', 'Técnico/Institución', 'Fecha', 'Lugar', 'Persona Evaluada'];
    columnasInformes = ['informe', 'nombreTecnico', 'fecha', 'lugar', 'personaEvaluada'];

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
  ) { }

  ngOnInit() {
     this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
    });
    this.loadDatosCierreCaso()

    this.formularioCierreCaso();
    this.formularioInformesPresentados();
    this.CierreCasoForm.valueChanges.subscribe(value => {
      console.log('CierreCasoForm value changed:', value);
    });
    this.informesPresentadosForm.valueChanges.subscribe(value => {
      console.log('InformesPresentadosForm value changed:', value);
    });
  }

  //FORMULARIO CIEERRE CASO//

  formularioCierreCaso() {
    this.CierreCasoForm = this.fb.group({
       idDenuncia: [this.denunciaId, Validators.required],
        codigoTramite:[],
        conclusion:[],
        secretariaAuxiliar:[],
        informesPresentados: this.fb.array([]),

    });
  }
  formularioInformesPresentados() {
    this.informesPresentadosForm = this.fb.group({
      informe:['', Validators.required],
      nombreTecnico:['', Validators.required],
      lugar:['', Validators.required],
      personaEvaluada:['', Validators.required],
      fecha:['', Validators.required],
    });
    console.log('Formulario informes creado:', this.informesPresentadosForm);
  }

  loadDatosCierreCaso(){
    this.cierreCasoService.obtenerDatosParaCierreCaso(this.denunciaId).subscribe(data=>{

      console.log('datos cierre caso',data);
      this.DatosCierreCaso=data;
      this.CierreCasoForm.patchValue({
        codigoTramite: data.codigoTramiteDenuncia,
      });
    });
  }

  // Getter para el FormArray
  get informesPresentadosArray(): FormArray {
    return this.CierreCasoForm.get('informesPresentados') as FormArray;
  }

  // Método para agregar informe al FormArray
  agregarInforme() {
    if (this.informesPresentadosForm.valid) {
      const informeData = this.informesPresentadosForm.value;

      // Crear FormGroup para el informe
      const informeFormGroup = this.fb.group({
        informe: [informeData.informe],
        nombreTecnico: [informeData.nombreTecnico],
        fecha: [informeData.fecha],
        lugar: [informeData.lugar],
        personaEvaluada: [informeData.personaEvaluada]
      });

      // Agregar al FormArray
      this.informesPresentadosArray.push(informeFormGroup);

      // Agregar a los datos de la tabla
      this.informesPresentadosData.push({...informeData});

      // Limpiar el formulario
      this.informesPresentadosForm.reset();

      console.log('Informe agregado:', informeData);
      console.log('FormArray actual:', this.informesPresentadosArray.value);
      console.log('Datos tabla:', this.informesPresentadosData);
    } else {
      console.log('Formulario inválido');
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.informesPresentadosForm.controls).forEach(key => {
        this.informesPresentadosForm.get(key)?.markAsTouched();
      });
    }
  }

  // Método para eliminar informe
  eliminarInforme(index: number) {
    this.informesPresentadosArray.removeAt(index);
    this.informesPresentadosData.splice(index, 1);
    console.log('Informe eliminado, FormArray actual:', this.informesPresentadosArray.value);
  }






  //---------------------------OTROS-------------------//
   cambiarTab(tab: string) {
    this.currentTab = tab;
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

      const body ={
    ...this.CierreCasoForm.value,

  }
  this.cierreCasoService.crearCierreCaso(body).subscribe({
    next: (body) => {

          console.log('ID de avocatoria guardada:', body)
          toast.success('avocatoria Guardada con Éxito', {
                    duration: 3000,
                  });


        },
        error(err) {

          toast.error('Error al guardar', {
            duration: 3000,
          description:`${err}`
          });

      }

  });

  }

}
export default Cierre_casoComponent;
