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
import { toast } from 'ngx-sonner';

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
  editandoIndex: number = -1; // Para rastrear si estamos editando y qué índice


  constructor(private fb: FormBuilder) {

  }

   private _filtrarNacionalidades(valor: string): string[] {
    const filtro = valor.toLowerCase();
    return this.nacionalidades.filter(n =>
      n.toLowerCase().includes(filtro)
    );
  }
  ngOnInit(): void {
    // Validar que el FormArray esté inicializado
    if (!this.formArray) {
      console.error('FormArray no está inicializado en el componente afectado');
      return;
    }

    this.afectadoForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), validarCedulaEcuador]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(17)]],
      meses: [null, []],
      sexo: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });

    // Actualizar validadores de meses según edad
    this.afectadoForm.get('edad')?.valueChanges.subscribe(edad => {
      const mesesControl = this.afectadoForm.get('meses');
      if (edad === 0) {
        mesesControl?.setValidators([Validators.required, Validators.min(1), Validators.max(11)]);
      } else {
        mesesControl?.clearValidators();
        mesesControl?.setValue(null);
      }
      mesesControl?.updateValueAndValidity();
    });
this.nacionalidadesFiltradas = this.afectadoForm.get('nacionalidad')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarNacionalidades(value || ''))
    );

  }




   agregarAfectado(): void {
  if (this.afectadoForm.valid) {
    if (this.editandoIndex >= 0) {
      // Si estamos editando, actualizar el elemento existente
      this.formArray.at(this.editandoIndex).patchValue(this.afectadoForm.value);
      toast.success('Afectado actualizado correctamente', {
        duration: 4000,
      });
      this.editandoIndex = -1; // Resetear el índice de edición
    } else {
      // Si no estamos editando, agregar nuevo elemento
      this.formArray.push(this.fb.group(this.afectadoForm.value));
      toast.success('Afectado agregado correctamente', {
        duration: 4000,
      });
    }
    this.afectadoForm.reset(); // limpiar el form
  } else {
    this.afectadoForm.markAllAsTouched();
    toast.error('Afectado no procesado', {
      duration: 3000,
      description: 'Por Favor, Completa Todos los Campos Requeridos',
    });
  }
}

editarAfectado(afectadoItem: any): void {
  console.log('Editando afectado con datos:', afectadoItem);

  // Validar que el FormArray existe y tiene elementos
  if (!this.formArray || this.formArray.length === 0) {
    toast.error('No hay datos para editar', {
      duration: 3000,
    });
    return;
  }

  // Validar que se recibió el objeto afectado
  if (!afectadoItem) {
    toast.error('Datos del afectado no proporcionados', {
      duration: 3000,
    });
    return;
  }

  // Buscar el índice del afectado en el FormArray comparando por cédula (campo único)
  let index = -1;
  for (let i = 0; i < this.formArray.length; i++) {
    const formValue = this.formArray.at(i)?.value;
    if (formValue && formValue.cedula === afectadoItem.cedula) {
      index = i;
      break;
    }
  }

  // Validar que se encontró el afectado
  if (index === -1) {
    toast.error('Afectado no encontrado en la lista', {
      duration: 3000,
    });
    return;
  }

  // Obtener el FormControl en el índice encontrado
  const afectadoControl = this.formArray.at(index);
  console.log('Estado actual del FormArray en índice', index, ':', afectadoControl?.value);

  // Validar que el FormControl existe
  if (!afectadoControl) {
    toast.error('Control del afectado no encontrado', {
      duration: 3000,
    });
    return;
  }

  // Cargar los datos en el formulario (usar los datos del item pasado)
  this.afectadoForm.patchValue(afectadoItem);

  // Marcar que estamos editando este índice
  this.editandoIndex = index;

  console.log('Editando afectado en índice:', index, 'con datos:', afectadoItem);
}

cancelarEdicion(): void {
  this.editandoIndex = -1;
  this.afectadoForm.reset();
  toast.info('Edición cancelada', {
    duration: 2000,
  });
}
eliminarAfectado(afectadoItem: any): void {
    // Validar que el FormArray existe y tiene elementos
    if (!this.formArray || this.formArray.length === 0) {
      toast.error('No hay datos para eliminar', {
        duration: 3000,
      });
      return;
    }

    // Validar que se recibió el objeto afectado
    if (!afectadoItem) {
      toast.error('Datos del afectado no proporcionados', {
        duration: 3000,
      });
      return;
    }

    // Buscar el índice del afectado en el FormArray comparando por cédula (campo único)
    let index = -1;
    for (let i = 0; i < this.formArray.length; i++) {
      const formValue = this.formArray.at(i)?.value;
      if (formValue && formValue.cedula === afectadoItem.cedula) {
        index = i;
        break;
      }
    }

    // Validar que se encontró el afectado
    if (index === -1) {
      toast.error('Afectado no encontrado en la lista', {
        duration: 3000,
      });
      return;
    }

    // Si estamos editando el elemento que vamos a eliminar, cancelar la edición
    if (this.editandoIndex === index) {
      this.cancelarEdicion();
    } else if (this.editandoIndex > index) {
      // Si eliminamos un elemento antes del que estamos editando, ajustar el índice
      this.editandoIndex--;
    }

    this.formArray.removeAt(index);
    toast.success('Afectado eliminado correctamente', {
      duration: 3000,
    });
  }

  // Getter para saber si estamos en modo edición
  get modoEdicion(): boolean {
    return this.editandoIndex >= 0;
  }

  // Getter para obtener los datos de la tabla de manera segura
  get datosTabla(): any[] {
    if (!this.formArray || this.formArray.length === 0) {
      return [];
    }
    try {
      return this.formArray.value || [];
    } catch (error) {
      console.error('Error al obtener datos del FormArray:', error);
      return [];
    }
  }




}
