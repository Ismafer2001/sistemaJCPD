import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { DenunciaService } from '../../services/denuncia.service';
import { Router } from '@angular/router';

@Component({
  selector: 'nna-page-crearDenuncia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './nna_page_crearDenuncia.component.html',
})
export class NnaPageCrearDenunciaComponent {
  denunciaForm: FormGroup;
  loading = false;
  error = '';

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
      })
    });
  }

  get denuncianteForm(): FormGroup {
    return this.denunciaForm.get('denunciante') as FormGroup;
  }

  cancelar(): void {
    this.router.navigate(['/nna/denuncias']);
  }

  onSubmit(): void {
    if (this.denunciaForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.denunciaForm.value;

      // Convertir la cédula a número
      formData.denunciante.cedula = parseInt(formData.denunciante.cedula, 10);
      formData.denunciante.edad = parseInt(formData.denunciante.edad, 10);

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
        } else {
          control?.markAsTouched();
        }
      });
    }
  }
}
export default NnaPageCrearDenunciaComponent;
