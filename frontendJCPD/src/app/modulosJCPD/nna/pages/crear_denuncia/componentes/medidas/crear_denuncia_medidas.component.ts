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
  todasLasMedidas: Medida[] = [];
  medidasFiltradas: Medida[] = []; // Array de medidas filtradas para mostrar
  cuerposLegalesDisponibles: string[] = []; // Lista de cuerpos legales únicos para el filtro
  loading = false;
  error: string | null = null;
  editandoIndex: number = -1; // Para rastrear si estamos editando y qué índice

  constructor(
    private medidasService: MedidasService,
    private fb: FormBuilder
  ) {
    this.medidasForm = this.fb.group({
      idAfectado: [, [Validators.required, Validators.minLength(1)]],
      cuerpoLegalFiltro: [''], // Campo para filtrar por cuerpo legal
      ids_medidas: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.cargarMedidas();

    // Suscribirse a cambios en el cuerpo legal filtro
    this.medidasForm.get('cuerpoLegalFiltro')?.valueChanges.subscribe(cuerpoLegal => {
      this.filtrarMedidasPorCuerpoLegal(cuerpoLegal);
    });

    this.medidasForm.valueChanges.subscribe(nna => {
      console.log('medidas:',nna);
    });
  }

  get mapeoAfectados() {
    return this.formArray.value.map((item: any) => {
      // Resolve afectado: item.idAfectado may be an index or an id; try index first
      let afectadoValue: any = null;
      if (this.formAfectados && this.formAfectados.length) {
        const idx = Number(item.idAfectado);
        if (!isNaN(idx) && this.formAfectados.at(idx)) {
          afectadoValue = this.formAfectados.at(idx)?.value;
        } else {
          // fallback: find control whose value.id matches item.idAfectado
          afectadoValue = this.formAfectados.controls.find((ctrl: any) => {
            const v = ctrl.value;
            return v && (v.id === item.idAfectado || String(v.id) === String(item.idAfectado));
          })?.value;
        }
      }

      const medidasNombres: string[] = [];

      // The saved array might be under `ids_medidas` or `medidas` depending on implementation
      const ids = Array.isArray(item.ids_medidas) ? item.ids_medidas : (Array.isArray(item.medidas) ? item.medidas : []);

      if (Array.isArray(ids)) {
        ids.forEach((medidaId: any) => {
          // Convertir a número para comparación consistente
          const numericMedidaId = Number(medidaId);

          // Buscar en todas las medidas
          const medidaEncontrada = this.todasLasMedidas.find((m: Medida) => Number(m.id) === numericMedidaId);
          if (medidaEncontrada) {
            medidasNombres.push(`${medidaEncontrada.medida} (${medidaEncontrada.cuerpoLegal})`);
          }
        });
      }

      return {
        ...item,
        idAfectado: afectadoValue ? afectadoValue.nombres : 'Desconocido',
        medidasPorArticulo: medidasNombres.join('\n - ')
      };
    });
}


  cargarMedidas() {
    this.loading = true;
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
        if (response.success) {
          this.todasLasMedidas = response.data;

          // Inicializar lista de cuerpos legales únicos para el filtro
          this.cuerposLegalesDisponibles = [...new Set(this.todasLasMedidas.map(medida => medida.cuerpoLegal))];

          // Inicializar medidas filtradas con todas las medidas
          this.inicializarMedidasFiltradas();

          console.log('Medidas cargadas:', this.todasLasMedidas);
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
  inicializarMedidasFiltradas(): void {
    // Mostrar todas las medidas disponibles
    this.medidasFiltradas = [...this.todasLasMedidas];
  }

  filtrarMedidasPorCuerpoLegal(cuerpoLegalNombre: string): void {
    if (!cuerpoLegalNombre || cuerpoLegalNombre === '') {
      // Si no hay filtro seleccionado, mostrar todas las medidas
      this.inicializarMedidasFiltradas();
    } else {
      // Filtrar medidas del cuerpo legal seleccionado
      this.medidasFiltradas = this.todasLasMedidas.filter(medida =>
        medida.cuerpoLegal === cuerpoLegalNombre
      );
    }
    // NO limpiar selecciones - mantener las selecciones existentes
  }

  // Método helper para obtener el nombre del cuerpo legal seleccionado
  getNombreCuerpoLegalSeleccionado(): string {
    return this.medidasForm.get('cuerpoLegalFiltro')?.value || '';
  }

  // Método helper para obtener el cuerpo legal de una medida
  getCuerpoLegalDeMedida(medidaId: number): string {
    const medida = this.todasLasMedidas.find(m => m.id === medidaId);
    return medida?.cuerpoLegal || 'Sin cuerpo legal';
  }

  toggleMedida(medidaId: number) {
    const control = this.medidasForm.get('ids_medidas');
    if (!control) return;

    // Asegurar que medidaId sea un número
    const numericMedidaId = Number(medidaId);

    const current = Array.isArray(control.value) ? control.value : [];
    // Convertir todos los valores del array a números para comparación consistente
    const currentNumbers = current.map(id => Number(id));

    const updated = currentNumbers.includes(numericMedidaId)
      ? currentNumbers.filter(id => id !== numericMedidaId)
      : [...currentNumbers, numericMedidaId];

    control.setValue(updated, { emitEvent: true });
  }

  isMedidaSelected(medidaId: number): boolean {
    const control = this.medidasForm.get('ids_medidas');
    const value = control?.value;
    if (!Array.isArray(value)) return false;

    // Asegurar que medidaId sea un número y convertir el array a números
    const numericMedidaId = Number(medidaId);
    const currentNumbers = value.map(id => Number(id));

    return currentNumbers.includes(numericMedidaId);
  }




  agregarMedida() {
    const idAfectado = this.medidasForm.get('idAfectado')?.value;
    const ids_medidas = this.medidasForm.get('ids_medidas')?.value;

    if (!idAfectado || !Array.isArray(ids_medidas)) {
      console.warn('Formulario incompleto');
      this.medidasForm.markAllAsTouched();
      toast.error('Medidas no agregadas', {
                duration: 3000,
                description: 'Por Favor, Completa Todos los Campos Requeridos',
                // delete: true,
              });
      return;
    }

    if (this.editandoIndex >= 0) {
      // Si estamos editando, actualizar el elemento existente
      this.formArray.at(this.editandoIndex).patchValue({
        idAfectado: idAfectado,
        medidas: ids_medidas
      });
      toast.success('Medidas actualizadas correctamente', {
        duration: 4000,
      });
      this.editandoIndex = -1; // Resetear el índice de edición
    } else {
      // Si no estamos editando, verificar duplicados y agregar nuevo elemento
      const yaExiste = this.formArray.controls.some(control => {
        return control.get('idAfectado')?.value === idAfectado;
      });

      if (yaExiste) {
        toast.error('Medidas ya registradas', {
          duration: 4000,
          description: 'Este afectado ya tiene medidas asignadas.',
        });
        return;
      }

      this.formArray.push(this.fb.group({
        idAfectado: [idAfectado],
        medidas: [ids_medidas]
      }));
      toast.success('Medidas agregadas', {
              duration: 3000,
              description: 'Las medidas se han agregado correctamente',
              // delete: true,
            });
    }

    this.medidasForm.reset();
  }
  eliminarRegistro(medidaItem: any): void {
    // Validar que el FormArray existe y tiene elementos
    if (!this.formArray || this.formArray.length === 0) {
      toast.error('No hay datos para eliminar', {
        duration: 3000,
      });
      return;
    }

    // Validar que se recibió el objeto
    if (!medidaItem) {
      toast.error('Datos no proporcionados para eliminar', {
        duration: 3000,
      });
      return;
    }

    // Buscar el índice del registro comparando por idAfectado (en el mapeo se convierte a nombre)
    let index = -1;
    for (let i = 0; i < this.formArray.length; i++) {
      const formValue = this.formArray.at(i)?.value;
      if (formValue) {
        const afectadoDelFormArray = this.formAfectados.at(formValue.idAfectado)?.value;
        const nombreAfectado = afectadoDelFormArray ? afectadoDelFormArray.nombres : 'Desconocido';

        if (nombreAfectado === medidaItem.idAfectado) {
          index = i;
          break;
        }
      }
    }

    // Validar que se encontró el registro
    if (index === -1) {
      toast.error('Registro no encontrado en la lista', {
        duration: 3000,
      });
      return;
    }

    // Si estamos editando el elemento que vamos a eliminar, cancelar la edición
    if (this.editandoIndex === index) {
      this.cancelarEdicion();
    } else if (this.editandoIndex > index) {
      // Si eliminamos un elemento antes del que estamos editando, ajustar el índice
      this.editandoIndex--;
    }

    this.formArray.removeAt(index);
    toast.success('Medidas eliminadas correctamente', {
      duration: 3000,
    });
  }

  editarMedidas(medidaItem: any): void {
    console.log('Editando medidas con datos:', medidaItem);

    // Validar que el FormArray existe y tiene elementos
    if (!this.formArray || this.formArray.length === 0) {
      toast.error('No hay datos para editar', {
        duration: 3000,
      });
      return;
    }

    // Validar que se recibió el objeto
    if (!medidaItem) {
      toast.error('Datos no proporcionados para editar', {
        duration: 3000,
      });
      return;
    }

    // Buscar el índice del registro comparando por idAfectado (en el mapeo se convierte a nombre)
    let index = -1;
    let datosOriginales = null;
    for (let i = 0; i < this.formArray.length; i++) {
      const formValue = this.formArray.at(i)?.value;
      if (formValue) {
        const afectadoDelFormArray = this.formAfectados.at(formValue.idAfectado)?.value;
        const nombreAfectado = afectadoDelFormArray ? afectadoDelFormArray.nombres : 'Desconocido';

        if (nombreAfectado === medidaItem.idAfectado) {
          index = i;
          datosOriginales = formValue;
          break;
        }
      }
    }

    // Validar que se encontró el registro
    if (index === -1 || !datosOriginales) {
      toast.error('Registro no encontrado para editar', {
        duration: 3000,
      });
      return;
    }

    // Cargar los datos originales en el formulario
    const medidasArray = datosOriginales.medidas || datosOriginales.ids_medidas;
    // Asegurar que los IDs sean números
    const medidasNumericas = Array.isArray(medidasArray) ? medidasArray.map(id => Number(id)) : [];

    this.medidasForm.patchValue({
      idAfectado: datosOriginales.idAfectado,
      ids_medidas: medidasNumericas
    });

    // Marcar que estamos editando este índice
    this.editandoIndex = index;

    console.log('Editando medidas en índice:', index, 'con datos:', datosOriginales);
  }

  cancelarEdicion(): void {
    this.editandoIndex = -1;
    this.medidasForm.reset();
    toast.info('Edición cancelada', {
      duration: 2000,
    });
  }

  // Getter para saber si estamos en modo edición
  get modoEdicion(): boolean {
    return this.editandoIndex >= 0;
  }

}
