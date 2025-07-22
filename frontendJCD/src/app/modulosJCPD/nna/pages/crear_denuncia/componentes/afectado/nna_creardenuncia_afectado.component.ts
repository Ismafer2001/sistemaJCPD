import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import TablaComponent from '@shared/components/tabla/tabla.component';

@Component({
  selector: 'nna_creardenuncia_afectado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TablaComponent],
  templateUrl: './nna_creardenuncia_afectado.component.html',
})
export class Nna_creardenuncia_afectadoComponent {
  @Input() formArray!: FormArray;
  afectadoForm:FormGroup;

  constructor(private fb: FormBuilder) {
    this.afectadoForm = this.fb.group({
  cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
  nombres: ['', [Validators.required, Validators.minLength(2)]],
  apellidos: ['', [Validators.required, Validators.minLength(2)]],
  edad: ['', [
          Validators.required,
          Validators.min(0),
          Validators.max(120)
        ]],
  sexo: ['', Validators.required],
  nacionalidad: ['', Validators.required],
  direccion: ['', [Validators.required, Validators.minLength(5)]],
  mail: ['', [Validators.required, Validators.email]],
  telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

});
  }





   agregarAfectado(): void {
  if (this.afectadoForm.valid) {
    this.formArray.push(this.fb.group(this.afectadoForm.value));
    this.afectadoForm.reset(); // limpio el form para el siguiente
  } else {
    this.afectadoForm.markAllAsTouched(); // para que muestre errores
  }
}
eliminarAfectado(index: number): void {
    this.formArray.removeAt(index);
  }




}
