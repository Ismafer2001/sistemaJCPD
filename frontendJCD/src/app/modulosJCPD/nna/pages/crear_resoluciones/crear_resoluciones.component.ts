import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder,
   FormGroup,
    ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { QuillModule } from 'ngx-quill';

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
 medidasDefinitivasForm!: FormGroup
 //-------------------------------------
 //

 //Variables para controlar los botones//
 pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;
  idAvocatoria!: number;
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

  constructor(private fb: FormBuilder,
              private router: Router,
  ) { }

  ngOnInit() {

  }
  //--------CRECION DE FORMULARIOS//
  formularioresoluciones(){
    this.resolucionesForm =this.fb.group({
      consideraciones: [''],
    resoluciones:[''],
    medidasDefinitivas:this.fb.array([])
    })
  }

  formularioMedidasDefinitivas(){
    this.medidasDefinitivasForm = this.fb.group({
      idAfectado: [''],
      idMedida: [''],
      medida: [''],
      periodo: [''],
      observaciones: [''],
    })
  }

//--------tabs----------------
   cambiarTab(tab: string) {
    this.currentTab = tab;
  }

}
export default Crear_resolucionesComponent;
