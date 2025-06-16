import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'nna_creardenuncia_denunciado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nna_creardenuncia_denunciado.component.html',
})
export class Nna_creardenuncia_denunciadoComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // No necesitamos agregar controles aquí ya que vienen del padre
  }
}
