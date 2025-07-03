import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { VulneracionService, Vulneracion } from '../../../../services/vulneracion.service';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-nna_creardenuncia_vulneraciones',
  templateUrl: './nna_creardenuncia_vulneraciones.component.html',

  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule]
})
export class Nna_creardenuncia_vulneracionesComponent implements OnInit {
    @Input() formGroup!: FormGroup;
  vulneraciones: Vulneracion[] = [];
  selectedVulneraciones: Set<number> = new Set();

  constructor(
    private vulneracionService: VulneracionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarVulneraciones();
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
    if (this.selectedVulneraciones.has(vulneracionId)) {
      this.selectedVulneraciones.delete(vulneracionId);
    } else {
      this.selectedVulneraciones.add(vulneracionId);
    }
    this.actualizarFormulario();
  }

  isVulneracionSelected(vulneracionId: number): boolean {
    return this.selectedVulneraciones.has(vulneracionId);
  }

  private actualizarFormulario(): void {
    if (this.formGroup) {
      this.formGroup.patchValue({
        ids: Array.from(this.selectedVulneraciones)
      });
    }
  }
}

