import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { VulneracionService, Vulneracion } from '../../../../services/vulneracion.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-nna_creardenuncia_vulneraciones',
  templateUrl: './nna_creardenuncia_vulneraciones.component.html',

  imports: [CommonModule, ReactiveFormsModule]
})
export class Nna_creardenuncia_vulneracionesComponent implements OnInit {
    @Input() formArray!: FormArray;
    @Input() formAfectados!: FormArray;
    vulneracionesForm: FormGroup;
    vulneraciones: Vulneracion[] = [];


  constructor(
    private vulneracionService: VulneracionService,
    private fb: FormBuilder
  ) {
    this.vulneracionesForm = this.fb.group({
      id_afectado: ["", [Validators.required, Validators.minLength(1)]],
      ids_vulneracion: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarVulneraciones();
    this.vulneracionesForm.valueChanges.subscribe(nna => {
      console.log('vulneraciones',nna);
    });
  }

  cargarVulneraciones(): void {
    this.vulneracionService.getVulneraciones().subscribe({
      next: (data) => {
        this.vulneraciones = data;
        // Inicializar los controles del formulario para cada vulneración

      },
      error: (error) => {
        console.error('Error al cargar vulneraciones:', error);
      }
    });
  }
   toggleVulneracion(vulneracionId: number): void {
  const control = this.vulneracionesForm.get('ids_vulneracion');
  if (!control) return;

  const current = Array.isArray(control.value) ? control.value : [];

  const updated = current.includes(vulneracionId)
    ? current.filter(id => id !== vulneracionId)
    : [...current, vulneracionId];

  control.setValue(updated, { emitEvent: true });
}


  isVulneracionSelected(vulneracionId: number): boolean {
  const control = this.vulneracionesForm.get('ids_vulneracion');
  const value = control?.value;
  return Array.isArray(value) && value.includes(vulneracionId);
}





  agregarVulneraciones(): void {
  const id_afectado = this.vulneracionesForm.get('id_afectado')?.value;
  const ids_vulneracion = this.vulneracionesForm.get('ids_vulneracion')?.value;

  if (!id_afectado || !Array.isArray(ids_vulneracion)) {
    console.warn('Formulario incompleto');
    this.vulneracionesForm.markAllAsTouched();
    return;
  }

  this.formArray.push(this.fb.group({
    id_afectado: [id_afectado],
    ids_vulneracion: [ids_vulneracion]
  }));

  this.vulneracionesForm.reset();
}






}

