import { Component,  Input, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, ReactiveFormsModule, Validators,AbstractControl, FormControl, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {InputsComponent} from '@shared/components/inputs/inputs.component';
import { validarCedulaEcuador } from '@shared/validators/cedula.validators';

@Component({
  selector: 'nna_creardenuncia_denunciante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,InputsComponent],
  templateUrl: './nna_creardenuncia_denunciante.component.html',
})
export class Nna_creardenuncia_denuncianteComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  formularioDenuncianteForm!: FormGroup;
  formControl!: FormControl;



  constructor(private fb: FormBuilder,

  ) {
  }
  ngOnInit(){
    


  }

  formularioDenunciante() {
    this.formularioDenuncianteForm = this.fb.group({
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
          })

  }




}
