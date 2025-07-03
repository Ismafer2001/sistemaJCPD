import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl
} from '@angular/forms';
import { DenunciaService } from '../../services/denuncia.service';
import { Router } from '@angular/router';
import { Nna_creardenuncia_denuncianteComponent } from './componentes/denunciante/nna_creardenuncia_denunciante.component';
import { Nna_creardenuncia_afectadoComponent } from './componentes/afectado/nna_creardenuncia_afectado.component';
import { Nna_creardenuncia_denunciadoComponent } from './componentes/denunciado/nna_creardenuncia_denunciado.component';
import { Nna_creardenuncia_vulneracionesComponent } from './componentes/vulneraciones/nna_creardenuncia_vulneraciones.component';
import { Crear_denuncia_medidasComponent } from './componentes/medidas/crear_denuncia_medidas.component';
//import { Generador_PDFService } from '../../../shared/services/pdf/generador_PDF.service';

@Component({
  selector: 'app-nna-page-crearDenuncia',
  templateUrl: './nna_page_crearDenuncia.component.html',

  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Nna_creardenuncia_denuncianteComponent,
    Nna_creardenuncia_afectadoComponent,
    Nna_creardenuncia_denunciadoComponent,
    Nna_creardenuncia_vulneracionesComponent,
    Crear_denuncia_medidasComponent
  ],
})
export class NnaPageCrearDenunciaComponent implements OnInit {


  currentTab = 0;  //variable para cambiar pestañas del formulario
  denunciaForm: FormGroup;

  
  loading = false;
  error: string | null = null;
   // Variable para el cantón
  anioActual: number;
  canton:string ;

  constructor(
    private fb: FormBuilder,
    private denunciaService: DenunciaService,
    private router: Router,
    //private pdfService: Generador_PDFService
  ) {
    this.anioActual=new Date().getFullYear();;
  this.canton ='PORTOVIEJO';
    this.denunciaForm = this.fb.group({
      num_tramite: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.min(1)
      ]],
      canton: [this.canton],
      anio: [this.anioActual],
      denunciante: this.fb.group({
        cedula: ['', [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]],
        nombres: ['', [
          Validators.required,
          Validators.minLength(2)
        ]],
        apellidos: ['', [
          Validators.required,
          Validators.minLength(2)
        ]],
        edad: ['', [
          Validators.required,
          Validators.min(0),
          Validators.max(120)
        ]],
        sexo: ['', Validators.required],

        nacionalidad: ['', Validators.required],
        direccion: ['', [
          Validators.required,
          Validators.minLength(5)
        ]],
        mail: ['', [
          Validators.required,
          Validators.email
        ]],
        telefono: ['', [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]]
      }),
      afectados: this.fb.array([]),
      denunciados: this.fb.array([]),
      descripcion_hechos: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      solicitud: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      vulneraciones: this.fb.group({
        ids: [[], [Validators.required, Validators.minLength(1)]]
      }),
      medidas: this.fb.group({
        ids: [[], [Validators.required, Validators.minLength(1)]]
      })
    });



  }

  ngOnInit() {

    this.afectadosArray.valueChanges.subscribe(val => {
  console.log('Afectados actuales:', val);
});

    // Suscribirse a los cambios del formulario
    this.denunciaForm.statusChanges.subscribe(status => {
      console.log('Estado del formulario:', {
        status,
        valid: this.denunciaForm.valid,
        invalid: this.denunciaForm.invalid,
        errors: this.denunciaForm.errors,
        value: this.denunciaForm.value
      });
    });
  }

  get denuncianteForm(): FormGroup {
    return this.denunciaForm.get('denunciante') as FormGroup;
  }

  get afectadosArray(): FormArray {
    return this.denunciaForm.get('afectados') as FormArray;
  }

  get denunciadosArray(): FormArray {
    return this.denunciaForm.get('denunciados') as FormArray;
  }

  get vulneracionesForm(): FormGroup {
    return this.denunciaForm.get('vulneraciones') as FormGroup;
  }
   get medidasForm(): FormGroup {
    return this.denunciaForm.get('medidas') as FormGroup;
  }



   cambiarTab(tab: number) {
    this.currentTab = tab;
  }

  cancelar(): void {
    this.router.navigate(['/nna']);
  }

  onSubmit(): void {
    this.router.navigate(['/nna']);

  }
}
export default NnaPageCrearDenunciaComponent;
