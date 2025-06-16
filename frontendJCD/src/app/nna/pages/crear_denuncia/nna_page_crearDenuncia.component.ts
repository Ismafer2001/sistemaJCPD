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
import { Nna_creardenuncia_hechosComponent } from './componentes/hechos/nna_creardenuncia_hechos.component';

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
    Nna_creardenuncia_hechosComponent
  ],
})
export class NnaPageCrearDenunciaComponent implements OnInit {
  denunciaForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private denunciaService: DenunciaService,
    private router: Router
  ) {
    this.denunciaForm = this.fb.group({
      medio: ['formulario'],
      tipo_denuncia: ['inicial'],
      canton: ['portovirjo'],
      denunciante: this.fb.group({
        cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        nombres: ['', [Validators.required, Validators.minLength(2)]],
        apellidos: ['', [Validators.required, Validators.minLength(2)]],
        edad: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
        genero: ['', Validators.required],
        nacionalidad: ['', Validators.required],
        direccion: ['', [Validators.required, Validators.minLength(5)]],
        mail: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
      }),
      afectados: this.fb.array([]),
      denunciados: this.fb.array([]),
      hechos: this.fb.group({
        descripcion_hechos: ['', [Validators.required, Validators.minLength(10)]],
        vulneraciones: [[], [Validators.required]]
      })
    });
  }

  ngOnInit() {
    this.agregarAfectado();
    this.agregarDenunciado();
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

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  agregarAfectado(): void {
    const afectadoForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      sexo: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
    this.afectadosArray.push(afectadoForm);
  }

  eliminarAfectado(index: number): void {
    this.afectadosArray.removeAt(index);
  }

  agregarDenunciado() {
    const denunciadoForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      sexo: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });

    this.denunciadosArray.push(denunciadoForm);
  }

  eliminarDenunciado(index: number) {
    if (this.denunciadosArray.length > 1) {
      this.denunciadosArray.removeAt(index);
    }
  }

  cancelar(): void {
    this.router.navigate(['/nna/denuncias']);
  }

  onSubmit(): void {
    if (this.denunciaForm.valid) {
      this.loading = true;
      this.error = null;

      const formData = this.denunciaForm.value;

      // Convertir la cédula a número
      formData.denunciante.cedula = parseInt(formData.denunciante.cedula, 10);
      formData.denunciante.edad = parseInt(formData.denunciante.edad, 10);

      // Convertir las cédulas de los afectados a número
      formData.afectados = formData.afectados.map((afectado: any) => ({
        ...afectado,
        cedula: parseInt(afectado.cedula, 10)
      }));

      console.log('Enviando datos:', formData);

      this.denunciaService.crearDenuncia(formData)
        .subscribe({
          next: (res) => {
            console.log('Respuesta del servidor:', res);
            this.loading = false;
            this.denunciaForm.reset();
            this.router.navigate(['/nna/ninos']);
          },
          error: (err) => {
            console.error('Error al crear la denuncia:', err);
            this.error = err.error?.message || 'Error al crear la denuncia';
            this.loading = false;
          }
        });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.denunciaForm.controls).forEach(key => {
        const control = this.denunciaForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            control.get(subKey)?.markAsTouched();
          });
        } else if (control instanceof FormArray) {
          control.controls.forEach(group => {
            if (group instanceof FormGroup) {
              Object.keys(group.controls).forEach(subKey => {
                group.get(subKey)?.markAsTouched();
              });
            }
          });
        } else {
          control?.markAsTouched();
        }
      });
    }
  }
}
export default NnaPageCrearDenunciaComponent;
