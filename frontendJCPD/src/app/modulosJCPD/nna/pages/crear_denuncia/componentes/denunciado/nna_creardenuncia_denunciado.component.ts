import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder,  FormGroup,  ReactiveFormsModule, Validators} from '@angular/forms';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

import { validarCedulaEcuador } from '@shared/validators/cedula.validators';
import { TablaEditComponent } from "../../../../../../shared/components/tabla/tablaEdit/tablaEdit.component";
import { toast } from 'ngx-sonner';

@Component({
  selector: 'nna_creardenuncia_denunciado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,  ButtonSubmitComponent, TablaEditComponent],
  templateUrl: './nna_creardenuncia_denunciado.component.html',
})
export class Nna_creardenuncia_denunciadoComponent implements OnInit {
  @Input() formArray!: FormArray;
  denunciadoForm!: FormGroup;
  editandoIndex: number = -1; // Para rastrear si estamos editando y qué índice

  constructor(private fb: FormBuilder) {

  }

  ngOnInit(): void {
    // Validar que el FormArray esté inicializado
    if (!this.formArray) {
      console.error('FormArray no está inicializado en el componente denunciado');
      return;
    }

    this.denunciadoForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'),validarCedulaEcuador]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      edad: ['', [
              Validators.required,
              Validators.min(0),
              Validators.max(120)
            ]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      sexo: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      parentezco: ['', [Validators.required, Validators.minLength(2)]],
    });
  }


  agregarDenunciado(): void {
    if (this.denunciadoForm.valid) {
      if (this.editandoIndex >= 0) {
        // Si estamos editando, actualizar el elemento existente
        this.formArray.at(this.editandoIndex).patchValue(this.denunciadoForm.value);
        toast.success('Denunciado actualizado correctamente', {
          duration: 4000,
        });
        this.editandoIndex = -1; // Resetear el índice de edición
      } else {
        // Si no estamos editando, agregar nuevo elemento
        this.formArray.push(this.fb.group(this.denunciadoForm.value));
        toast.success('Denunciado agregado correctamente', {
          duration: 4000,
        });
      }
      this.denunciadoForm.reset(); // limpiar el form
    } else {
      this.denunciadoForm.markAllAsTouched();
      toast.error('Denunciado no procesado', {
        duration: 3000,
        description: 'Por Favor, Completa Todos los Campos Requeridos',
      });
    }
  }
  eliminarDenunciado(denunciadoItem: any): void {
    // Validar que el FormArray existe y tiene elementos
    if (!this.formArray || this.formArray.length === 0) {
      toast.error('No hay datos para eliminar', {
        duration: 3000,
      });
      return;
    }

    // Validar que se recibió el objeto denunciado
    if (!denunciadoItem) {
      toast.error('Datos del denunciado no proporcionados', {
        duration: 3000,
      });
      return;
    }

    // Buscar el índice del denunciado en el FormArray comparando por cédula (campo único)
    let index = -1;
    for (let i = 0; i < this.formArray.length; i++) {
      const formValue = this.formArray.at(i)?.value;
      if (formValue && formValue.cedula === denunciadoItem.cedula) {
        index = i;
        break;
      }
    }

    // Validar que se encontró el denunciado
    if (index === -1) {
      toast.error('Denunciado no encontrado en la lista', {
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
    toast.success('Denunciado eliminado correctamente', {
      duration: 3000,
    });
  }

  editarDenunciado(denunciadoItem: any): void {
    console.log('Editando denunciado con datos:', denunciadoItem);

    // Validar que el FormArray existe y tiene elementos
    if (!this.formArray || this.formArray.length === 0) {
      toast.error('No hay datos para editar', {
        duration: 3000,
      });
      return;
    }

    // Validar que se recibió el objeto denunciado
    if (!denunciadoItem) {
      toast.error('Datos del denunciado no proporcionados', {
        duration: 3000,
      });
      return;
    }

    // Buscar el índice del denunciado en el FormArray comparando por cédula (campo único)
    let index = -1;
    for (let i = 0; i < this.formArray.length; i++) {
      const formValue = this.formArray.at(i)?.value;
      if (formValue && formValue.cedula === denunciadoItem.cedula) {
        index = i;
        break;
      }
    }

    // Validar que se encontró el denunciado
    if (index === -1) {
      toast.error('Denunciado no encontrado en la lista', {
        duration: 3000,
      });
      return;
    }

    // Obtener el FormControl en el índice encontrado
    const denunciadoControl = this.formArray.at(index);
    console.log('Estado actual del FormArray en índice', index, ':', denunciadoControl?.value);

    // Validar que el FormControl existe
    if (!denunciadoControl) {
      toast.error('Control del denunciado no encontrado', {
        duration: 3000,
      });
      return;
    }

    // Cargar los datos en el formulario (usar los datos del item pasado)
    this.denunciadoForm.patchValue(denunciadoItem);

    // Marcar que estamos editando este índice
    this.editandoIndex = index;

    console.log('Editando denunciado en índice:', index, 'con datos:', denunciadoItem);
  }

  cancelarEdicion(): void {
    this.editandoIndex = -1;
    this.denunciadoForm.reset();
    toast.info('Edición cancelada', {
      duration: 2000,
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
