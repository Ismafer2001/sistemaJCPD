import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { map, Observable, startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { validarCedulaEcuador } from '@shared/validators/cedula.validators';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

@Component({
  selector: 'nna_creardenuncia_afectado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, TablaEditComponent,ButtonSubmitComponent],
  templateUrl: './nna_creardenuncia_afectado.component.html',


})
export class Nna_creardenuncia_afectadoComponent implements OnInit {
  @Input() formArray!: FormArray;
  afectadoForm!:FormGroup;
  nacionalidades: string[] = ['Peruana', 'Venezolana', 'Colombiana', 'Argentina', 'Chilena'];
  nacionalidadesFiltradas!: Observable<string[]>;


  constructor(private fb: FormBuilder) {

  }

   private _filtrarNacionalidades(valor: string): string[] {
    const filtro = valor.toLowerCase();
    return this.nacionalidades.filter(n =>
      n.toLowerCase().includes(filtro)
    );
  }
  ngOnInit(): void {
    this.afectadoForm = this.fb.group({
  cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'),validarCedulaEcuador]],
  nombres: ['', [Validators.required, Validators.minLength(2)]],
  apellidos: ['', [Validators.required, Validators.minLength(2)]],
  edad: ['', [
          Validators.required,
          Validators.min(0),
          Validators.max(17)
        ]],
  sexo: ['', Validators.required],
  nacionalidad: ['', Validators.required],
  direccion: ['', [Validators.required, Validators.minLength(5)]],
  mail: ['', [Validators.required, Validators.email]],
  telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

});
this.nacionalidadesFiltradas = this.afectadoForm.get('nacionalidad')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarNacionalidades(value || ''))
    );

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
