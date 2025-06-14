import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'nna_creardenuncia_denunciante',
  imports:[ReactiveFormsModule],
  templateUrl: './nna_creardenuncia_denunciante.component.html',

})
export class Nna_creardenuncia_denuncianteComponent implements OnInit {

  @Input() formGroup!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup.addControl('nombres', this.fb.control('', Validators.required));
    this.formGroup.addControl('apellidos', this.fb.control(''));
    this.formGroup.addControl('cedula', this.fb.control(''));
    this.formGroup.addControl('edad', this.fb.control(''));
    this.formGroup.addControl('genero', this.fb.control(''));
  }

}
