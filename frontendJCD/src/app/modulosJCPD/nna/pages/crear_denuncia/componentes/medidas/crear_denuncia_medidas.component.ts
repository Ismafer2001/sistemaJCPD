import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedidasService, ArticuloMedidas } from '../../../../services/medidas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear_denuncia_medidas',
  imports:[CommonModule, ReactiveFormsModule],
  templateUrl: './crear_denuncia_medidas.component.html',

})
export class Crear_denuncia_medidasComponent implements OnInit {
  @Input() formArray!: FormArray;
  @Input() formAfectados!:FormArray; // Assuming this is used for some other purpose
  medidasPorArticulo: ArticuloMedidas[] = [];
  medidasForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private medidasService: MedidasService,
    private fb: FormBuilder
  ) {
    this.medidasForm = this.fb.group({
      id_afectado: ["", [Validators.required, Validators.minLength(1)]],
      ids_medidas: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.cargarMedidas();
    this.medidasForm.valueChanges.subscribe(nna => {
      console.log('medidas:',nna);
    });
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


  toggleMedida(medidaId: number) {
    const control = this.medidasForm.get('ids_medidas');
    if (!control) return;

    const current = Array.isArray(control.value) ? control.value : [];
    const updated = current.includes(medidaId)
      ? current.filter(id => id !== medidaId)
      : [...current, medidaId];

    control.setValue(updated, { emitEvent: true });
  }

  isMedidaSelected(medidaId: number): boolean {
    const control = this.medidasForm.get('ids_medidas');
    const value = control?.value;
    return Array.isArray(value) && value.includes(medidaId);
  }
  agregarMedida() {
    const id_afectado = this.medidasForm.get('id_afectado')?.value;
  const ids_medidas = this.medidasForm.get('ids_medidas')?.value;
    if (!id_afectado || !Array.isArray(ids_medidas)) {
      console.warn('Formulario incompleto');
    this.medidasForm.markAllAsTouched();
    return;
    }
    this.formArray.push(this.fb.group({
    id_afectado: [id_afectado],
    medidas: [ids_medidas]
  }));

  this.medidasForm.reset();
  }






}
