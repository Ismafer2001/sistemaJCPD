import { Component, input, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nna_creardenuncia_denunciante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nna_creardenuncia_denunciante.component.html',
})
export class Nna_creardenuncia_denuncianteComponent  {
  @Input() formGroup!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup =this.fb.group({
      



    })


  }


}
