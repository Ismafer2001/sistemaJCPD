import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { DenunciaService } from '../../services/denuncia.service';
import { Router } from '@angular/router';
import { Nna_creardenuncia_denuncianteComponent } from './componentes/denunciante/nna_creardenuncia_denunciante.component';
import { Nna_creardenuncia_afectadoComponent } from './componentes/afectado/nna_creardenuncia_afectado.component';
import { Nna_creardenuncia_denunciadoComponent } from './componentes/denunciado/nna_creardenuncia_denunciado.component';
import { Nna_creardenuncia_vulneracionesComponent } from './componentes/vulneraciones/nna_creardenuncia_vulneraciones.component';
import { Crear_denuncia_medidasComponent } from './componentes/medidas/crear_denuncia_medidas.component';
import { AuthService } from '@auth/services/auth.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { validarCedulaEcuador } from '@shared/validators/cedula.validators';
import {ButtonSubmitComponent} from '@shared/components/button-submit/button-submit.component';
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
    Crear_denuncia_medidasComponent,
    CardFormComponent, ButtonSubmitComponent
  ],
})
export class NnaPageCrearDenunciaComponent implements OnInit {
  numTramiteDisabled = true;
  currentTab = 0; //variable para cambiar pestañas del formulario
  denunciaForm!: FormGroup;
  incrementar = false;

  loading = false;
  error: string | null = null;
  // Variable para el cantón
  anioActual!: number;
  canton!: string;

  constructor(
    private AuthService: AuthService,
    private fb: FormBuilder,
    private denunciaService: DenunciaService,
    private router: Router
  ) //private pdfService: Generador_PDFService
  {}

  ngOnInit(): void {
    this.denunciaFormulario();

    this.AuthService.getUsuarioActual().subscribe((user) => {
      this.denunciaForm.get('id_canton')?.setValue(user.id_canton);

      this.canton = user.canton;
    });

    this.denunciaService.obtenerNumTramite('nna').subscribe((res) => {
  if (res.numero) {
    this.denunciaService.obtenerNumTramite('nna', true).subscribe((res2) => {
      this.setearNumTramite(res2.numero);
    });
  } else {
    this.numTramiteDisabled = false;
    this.denunciaForm.get('num_tramite')?.enable();
  }
});

    this.denunciaForm.valueChanges.subscribe((data) => {
      console.log(data);
    });
  }

  //--------- CREACION FORMULARIO--------------------//
  denunciaFormulario() {
    this.anioActual = new Date().getFullYear();
    this.canton = '';

    this.denunciaForm = this.fb.group({
      num_tramite: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.min(1),
        ],
      ],
      tipo_denuncia: ["", Validators.required],
      medio: ['', Validators.required],

      anio: [this.anioActual],

      denunciante: this.fb.group({
        cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'),validarCedulaEcuador] ],
        nombres: ['', [Validators.required, Validators.minLength(2)]],
        apellidos: ['', [Validators.required, Validators.minLength(2)]],
        edad: [
          '',
          [Validators.required, Validators.min(0), Validators.max(120)],
        ],
        sexo: ['', Validators.required],

        nacionalidad: ['', Validators.required],
        direccion: ['', [Validators.required, Validators.minLength(5)]],
        mail: ['', [Validators.required, Validators.email]],
        telefono: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
      }),
      afectados: this.fb.array([], Validators.required),
      denunciados: this.fb.array([], Validators.required),
      descripcion_hechos: ['', [Validators.required, Validators.minLength(10)]],
      solicitud: ['', [Validators.required, Validators.minLength(10)]],
      vulneraciones: this.fb.array([], Validators.required),
      medidas: this.fb.array([], Validators.required),
      id_canton: [],
      grupoPrioritario: ['nna'],
    });
  }

  //----------------GETTERS FORMULARIOS-----------------//

  get denuncianteForm(): FormGroup {
    return this.denunciaForm.get('denunciante') as FormGroup;
  }

  get afectadosArray(): FormArray {
    return this.denunciaForm.get('afectados') as FormArray;
  }

  get denunciadosArray(): FormArray {
    return this.denunciaForm.get('denunciados') as FormArray;
  }

  get vulneracionesForm(): FormArray {
    return this.denunciaForm.get('vulneraciones') as FormArray;
  }
  get medidasForm(): FormArray {
    return this.denunciaForm.get('medidas') as FormArray;
  }

  //---------------------OTROS----------------------///
 seleccionarTipo(tipo: 'oficio' | 'externa') {
    this.denunciaForm.get('tipo_denuncia')?.setValue(tipo);
  }

  cambiarTab(tab: number) {
    this.currentTab = tab;
  }
  bloquearNumTramite(): void {
    if (!this.numTramiteDisabled) {
      this.numTramiteDisabled = true;
      this.denunciaForm.get('num_tramite')?.disable();
    }
  }
  private setearNumTramite(numero: number): void {
    const numeroFormateado = this.formatearNumeroTramite(numero);
    this.denunciaForm.get('num_tramite')?.setValue(numeroFormateado);
    this.bloquearNumTramite();
  }

  private formatearNumeroTramite(numero: number, longitud: number = 4): string {
    return numero.toString().padStart(longitud, '0');
  }

  //---------------------------CANCELAR Y SUBMIT-------------------///
  cancelar(): void {
    this.router.navigate(['/nna']);
  }

  onSubmit(): void {
    if (this.denunciaForm.invalid) {
      this.denunciaForm.markAllAsTouched();
      this.error = 'Complete todos los campos requeridos';
      return;
    }
    // Construir el código de trámite
    const numTramite = this.denunciaForm.get('num_tramite')?.value;
    const codigoTramite = `${numTramite}-JCPD-${this.canton}-${this.anioActual}-NIÑOS`;

    // Construir el objeto final
    const body = {
      ...this.denunciaForm.value,
      codigoTramite,
      status: 'completada',
    };

    this.loading = true;
    this.denunciaService.crearDenuncia(body).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/nna']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al guardar la denuncia';
        console.error(err);
      },
    });
  }
}
export default NnaPageCrearDenunciaComponent;
