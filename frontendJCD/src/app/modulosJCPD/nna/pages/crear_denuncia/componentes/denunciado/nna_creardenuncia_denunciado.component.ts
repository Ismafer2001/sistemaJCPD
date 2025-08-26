import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder,  FormGroup,  ReactiveFormsModule, Validators} from '@angular/forms';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { validarCedulaEcuador } from '@shared/validators/cedula.validators';

@Component({
  selector: 'nna_creardenuncia_denunciado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TablaComponent,ButtonSubmitComponent],
  templateUrl: './nna_creardenuncia_denunciado.component.html',
})
export class Nna_creardenuncia_denunciadoComponent {
  @Input() formArray!: FormArray;
  denunciadoForm:FormGroup

  constructor(private fb: FormBuilder) {
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
      this.formArray.push(this.fb.group(this.denunciadoForm.value));
      this.denunciadoForm.reset(); // limpio el form para el siguiente
    } else {
      this.denunciadoForm.markAllAsTouched(); // para que muestre errores
    }
  }
  eliminarDenunciado(index: number): void {
    this.formArray.removeAt(index);
  }


}
