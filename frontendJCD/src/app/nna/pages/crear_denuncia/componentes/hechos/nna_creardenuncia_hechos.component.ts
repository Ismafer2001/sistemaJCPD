import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VulneracionService } from '@nna/services/vulneracion.service';

@Component({
  selector: 'app-nna_creardenuncia_hechos',
  templateUrl: './nna_creardenuncia_hechos.component.html',

})
export class Nna_creardenuncia_hechosComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  vulneraciones: any[] = [];
  selectedVulneraciones: Set<number> = new Set();

  constructor(
    private vulneracionService: VulneracionService
  ) {}

  ngOnInit(): void {
    this.cargarVulneraciones();
  }

  cargarVulneraciones(): void {
    this.vulneracionService.getVulneraciones().subscribe({
      next: (data) => {
        this.vulneraciones = data;
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
        descripcion_hechos: this.formGroup.get('descripcion_hechos')?.value,
        vulneraciones: Array.from(this.selectedVulneraciones)
      });
    }
  }
}
