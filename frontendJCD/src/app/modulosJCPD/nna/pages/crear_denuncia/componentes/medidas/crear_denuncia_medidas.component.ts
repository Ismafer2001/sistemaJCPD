import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MedidasService, ArticuloMedidas } from '../../../../services/medidas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear_denuncia_medidas',
  imports:[CommonModule],
  templateUrl: './crear_denuncia_medidas.component.html',

})
export class Crear_denuncia_medidasComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  medidasPorArticulo: ArticuloMedidas[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private medidasService: MedidasService
  ) { }

  ngOnInit() {
    this.cargarMedidas();
  }

  cargarMedidas() {
    this.loading = true;
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
        if (response.success) {
          this.medidasPorArticulo = response.data;
        } else {
          this.error = 'Error al cargar las medidas';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar medidas:', error);
        this.error = 'Error al cargar las medidas';
        this.loading = false;
      }
    });
  }

  onMedidaSeleccionada(medidaId: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const medidasForm = this.formGroup.get('ids');
    const medidasActuales = medidasForm?.value || [];

    if (checkbox.checked) {
      medidasForm?.setValue([...medidasActuales, medidaId]);
    } else {
      medidasForm?.setValue(medidasActuales.filter((id: number) => id !== medidaId));
    }
  }

  isMedidaSeleccionada(medidaId: number): boolean {
    const medidasForm = this.formGroup.get('ids');
    const medidasSeleccionadas = medidasForm?.value || [];
    return medidasSeleccionadas.includes(medidaId);
  }
}
