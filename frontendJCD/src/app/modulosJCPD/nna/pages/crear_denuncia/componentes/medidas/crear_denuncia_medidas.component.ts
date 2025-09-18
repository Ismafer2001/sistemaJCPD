import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedidasService, ArticuloMedidas, Medida } from '../../../../services/medidas.service';
import { CommonModule } from '@angular/common';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-crear_denuncia_medidas',
  imports:[CommonModule, ReactiveFormsModule, ButtonSubmitComponent, TablaEditComponent],
  templateUrl: './crear_denuncia_medidas.component.html',

})
export class Crear_denuncia_medidasComponent implements OnInit {
  @Input() formArray!: FormArray;
  @Input() formAfectados!:FormArray; // Assuming this is used for some other purpose
  medidasForm: FormGroup;
  medidasPorArticulo: ArticuloMedidas[] = [];
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

  get mapeoAfectados() {
    return this.formArray.value.map((item: any) => {
      // Resolve afectado: item.id_afectado may be an index or an id; try index first
      let afectadoValue: any = null;
      if (this.formAfectados && this.formAfectados.length) {
        const idx = Number(item.id_afectado);
        if (!isNaN(idx) && this.formAfectados.at(idx)) {
          afectadoValue = this.formAfectados.at(idx)?.value;
        } else {
          // fallback: find control whose value.id matches item.id_afectado
          afectadoValue = this.formAfectados.controls.find((ctrl: any) => {
            const v = ctrl.value;
            return v && (v.id === item.id_afectado || String(v.id) === String(item.id_afectado));
          })?.value;
        }
      }

      const medidasNombres: string[] = [];

      // The saved array might be under `ids_medidas` or `medidas` depending on implementation
      const ids = Array.isArray(item.ids_medidas) ? item.ids_medidas : (Array.isArray(item.medidas) ? item.medidas : []);

      if (Array.isArray(ids)) {
        ids.forEach((medidaId: number) => {
          // Search each articulo for the medida with matching id
          for (const articulo of this.medidasPorArticulo) {
            if (Array.isArray(articulo.medidas)) {
              const m = articulo.medidas.find((mm: Medida) => mm.id === medidaId || String(mm.id) === String(medidaId));
              if (m) {
                medidasNombres.push(m.medida);
                break; // found in this articulo, continue with next id
              }
            }
          }
        });
      }

      return {
        ...item,
        id_afectado: afectadoValue ? afectadoValue.nombres : 'Desconocido',
        medidasPorArticulo: medidasNombres.join('\n - ')
      };
    });
}


  cargarMedidas() {
    this.loading = true;
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
        if (response.success) {
          this.medidasPorArticulo = response.data;
          console.log('Medidas cargadas:', this.medidasPorArticulo);
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
    toast.error('Medidas no agregadas', {
              duration: 3000,
              description: 'Por Favor, Completa Todos los Campos Requeridos',
              // delete: true,
            });
    return;
    }
    this.formArray.push(this.fb.group({
    id_afectado: [id_afectado],
    medidas: [ids_medidas]
  }));
  toast.success('Medidas agregadas', {
          duration: 3000,
          description: 'Las medidas se han agregado correctamente',
          // delete: true,
        });

  this.medidasForm.reset();
  }
  eliminarRegistro(index: number) {
  this.formArray.removeAt(index);
}






}
