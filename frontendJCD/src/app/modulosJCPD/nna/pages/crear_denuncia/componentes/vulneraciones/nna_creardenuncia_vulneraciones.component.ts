import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { VulneracionService, Vulneracion } from '../../../../services/vulneracion.service';
import { CommonModule } from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { toast } from 'ngx-sonner';


@Component({
  selector: 'app-nna_creardenuncia_vulneraciones',
  templateUrl: './nna_creardenuncia_vulneraciones.component.html',

  imports: [CommonModule, ReactiveFormsModule,MatCheckboxModule,ButtonSubmitComponent,TablaEditComponent]
})
export class Nna_creardenuncia_vulneracionesComponent implements OnInit {
    @Input() formArray!: FormArray;
    @Input() formAfectados!: FormArray;
    vulneracionesForm: FormGroup;
    vulneraciones: Vulneracion[] = [];
    vulneracionesFiltradas: Vulneracion[] = []; // Para las vulneraciones filtradas
    cuerposLegales: any[] = []; // Lista de cuerpos legales disponibles
    editandoIndex: number = -1; // Para rastrear si estamos editando y qué índice


  constructor(
    private vulneracionService: VulneracionService,
    private fb: FormBuilder
  ) {
    this.vulneracionesForm = this.fb.group({
      idAfectado: [, [Validators.required, Validators.minLength(1)]],
      cuerpoLegal: [''], // Nuevo campo para filtro
      vulneraciones: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarVulneraciones();
    this.cargarCuerposLegales();

    // Suscribirse a cambios en el cuerpo legal para filtrar
    this.vulneracionesForm.get('cuerpoLegal')?.valueChanges.subscribe(cuerpoLegal => {
      this.filtrarVulneraciones(cuerpoLegal);
    });

    
  }


get mapeoAfectados() {
  return this.formArray.value.map((item: any) => {
    const afectado = this.formAfectados.at(item.idAfectado)?.value;
    const vulneracionesNombres = item.vulneraciones.map((id: number) => {
      const v = this.vulneraciones.find(v => v.id === id);
      return v ? v.vulneracion : 'Desconocido';
    });

    return {
      ...item,
      idAfectado: afectado ? afectado.nombres : 'Desconocido',
      vulneraciones: vulneracionesNombres.join('\n -')
    };
  });
}


  cargarVulneraciones(): void {
    this.vulneracionService.getVulneraciones().subscribe({
      next: (data) => {
        this.vulneraciones = data;
        this.vulneracionesFiltradas = data; // Inicialmente mostrar todas

        // Inicializar los controles del formulario para cada vulneración

      },
      error: (error) => {
        console.error('Error al cargar vulneraciones:', error);
      }
    });
  }

  cargarCuerposLegales(): void {
    // Lista de cuerpos legales con los códigos que vienen del JSON
    this.cuerposLegales = [
      { id: 'CONNA', nombre: 'Código de la Niñez y Adolescencia' },
      { id: 'LOPAM', nombre: 'Ley de Personas Adultas Mayores' },
      { id: 'LOIPEVCM', nombre: 'Ley Orgánica Integral para Prevenir y Erradicar la Violencia contra las Mujeres' }
    ];
  }

  filtrarVulneraciones(cuerpoLegalId: string): void {
    if (!cuerpoLegalId || cuerpoLegalId === '') {
      // Si no hay filtro seleccionado, mostrar todas
      this.vulneracionesFiltradas = this.vulneraciones;
    } else {
      // Filtrar por cuerpo legal comparando directamente los códigos de texto
      this.vulneracionesFiltradas = this.vulneraciones.filter(v =>
        String(v.cuerpoLegal) === cuerpoLegalId
      );
    }
    // NO limpiar selecciones - mantener las selecciones existentes
  }

  // Método helper para obtener el nombre del cuerpo legal seleccionado
  getNombreCuerpoLegalSeleccionado(): string {
    const cuerpoLegalId = this.vulneracionesForm.get('cuerpoLegal')?.value;
    const cuerpoLegal = this.cuerposLegales.find(c => c.id === cuerpoLegalId);
    return cuerpoLegal?.nombre || '';
  }

  // Método helper para obtener el nombre del cuerpo legal de una vulneración
  getNombreCuerpoLegal(cuerpoLegalId: string | number): string {
    const id = String(cuerpoLegalId);
    const cuerpoLegal = this.cuerposLegales.find(c => c.id === id);
    return cuerpoLegal?.nombre || 'Sin cuerpo legal';
  }
   toggleVulneracion(vulneraciones: number): void {
  const control = this.vulneracionesForm.get('vulneraciones');



  if (!control) return;

  const current = Array.isArray(control.value) ? control.value : [];

  const updated = current.includes(vulneraciones)
    ? current.filter(id => id !== vulneraciones)
    : [...current, vulneraciones];

  control.setValue(updated, { emitEvent: true });
}


  isVulneracionSelected(vulneraciones: number): boolean {
  const control = this.vulneracionesForm.get('vulneraciones');
  const value = control?.value;
  return Array.isArray(value) && value.includes(vulneraciones);
}





  agregarVulneraciones(): void {
  const idAfectado = this.vulneracionesForm.get('idAfectado')?.value;
  const vulneraciones = this.vulneracionesForm.get('vulneraciones')?.value;

  if (!idAfectado || !Array.isArray(vulneraciones)) {
    console.warn('Formulario incompleto');
    this.vulneracionesForm.markAllAsTouched();
    toast.error('vulneraciones no agregadas', {
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
      vulneraciones: vulneraciones
    });
    toast.success('Vulneraciones actualizadas correctamente', {
      duration: 4000,
    });
    this.editandoIndex = -1; // Resetear el índice de edición
  } else {
    // Si no estamos editando, verificar duplicados y agregar nuevo elemento
    const yaExiste = this.formArray.controls.some(control => {
      return control.get('idAfectado')?.value === idAfectado;
    });

    if (yaExiste) {
      toast.error('Vulneraciones ya registradas', {
        duration: 4000,
        description: 'Este afectado ya tiene vulneraciones asignadas.',
      });
      return;
    }

    this.formArray.push(this.fb.group({
      idAfectado: [idAfectado],
      vulneraciones: [vulneraciones]
    }));
    toast.success('Vulneraciones agregadas', {
            duration: 3000,
            description: 'Las vulneraciones se han agregado correctamente',
            // delete: true,
          });
  }

  this.vulneracionesForm.reset();
  console.log(this.formArray.value)
}

eliminarRegistro(vulneracionItem: any): void {
  // Validar que el FormArray existe y tiene elementos
  if (!this.formArray || this.formArray.length === 0) {
    toast.error('No hay datos para eliminar', {
      duration: 3000,
    });
    return;
  }

  // Validar que se recibió el objeto
  if (!vulneracionItem) {
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

      if (nombreAfectado === vulneracionItem.idAfectado) {
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
  toast.success('Vulneraciones eliminadas correctamente', {
    duration: 3000,
  });
}

editarVulneraciones(vulneracionItem: any): void {
  console.log('Editando vulneraciones con datos:', vulneracionItem);

  // Validar que el FormArray existe y tiene elementos
  if (!this.formArray || this.formArray.length === 0) {
    toast.error('No hay datos para editar', {
      duration: 3000,
    });
    return;
  }

  // Validar que se recibió el objeto
  if (!vulneracionItem) {
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

      if (nombreAfectado === vulneracionItem.idAfectado) {
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
  this.vulneracionesForm.patchValue({
    idAfectado: datosOriginales.idAfectado,
    vulneraciones: datosOriginales.vulneraciones
  });

  // Marcar que estamos editando este índice
  this.editandoIndex = index;

  console.log('Editando vulneraciones en índice:', index, 'con datos:', datosOriginales);
}

cancelarEdicion(): void {
  this.editandoIndex = -1;
  this.vulneracionesForm.reset();
  toast.info('Edición cancelada', {
    duration: 2000,
  });
}

// Getter para saber si estamos en modo edición
get modoEdicion(): boolean {
  return this.editandoIndex >= 0;
}

}

