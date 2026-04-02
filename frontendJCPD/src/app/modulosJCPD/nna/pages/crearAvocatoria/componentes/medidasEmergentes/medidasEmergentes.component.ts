import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedidasService } from '@nna/services/medidas.service';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';

@Component({
  selector: 'app-medidasEmergentes',
  templateUrl: './medidasEmergentes.component.html',
  imports:[CommonModule,
    ReactiveFormsModule,
    TablaEditComponent,
    ButtonSubmitComponent
  ]

})
export class MedidasEmergentesComponent implements OnInit {
  medidasEmergentesForm!: FormGroup;
  medidasEmergentesArray: any[] = []; // Array para almacenar medidas emergentes

  constructor(private medidasService: MedidasService,
    private fb:FormBuilder,
  ) { }

  ngOnInit() {
    this.formularioMedidasEmergentes();
  }

   formularioMedidasEmergentes() {
     this.medidasEmergentesForm= this.fb.group({
        idAfectado: ['', Validators.required],
        idMedida: ['', Validators.required],
        medida: ['', Validators.required],
        periodo: ['', Validators.required],
        observaciones: ['', Validators.required],

      });
    }

     medidasEmergentes(event: Event) {
    const target = event.target as HTMLSelectElement;
  const afectadoId = parseInt(target.value, 10);
  if (!afectadoId) return;

  // reset editor to avoid leftover selection from other afectado
  this.resetEditor();

  // Cargar medidas identificadas para agregar como emergentes
  this.loadMedidasporafectado(afectadoId);

  // Obtener medidas emergentes existentes para este afectado
  this.obtenerMedidasEmergentesPorAfectado();

  }
  resetEditor() {
    
    this.medidasEmergentesForm.reset({

      idMedida: null,
      medida: '',
      periodo: '',
      observaciones: ''
    });
  }

  loadMedidasporafectado(afectadoId: number) {
    if (!afectadoId) return;

    // Consumir API de medidas identificadas
    this.medidasService.getMedidasidentificadas(afectadoId).subscribe({
      next: (response: any) => {
        console.log('Medidas identificadas obtenidas:', response);

        // Obtener la lista de medidas del afectado
        const medidasIdentificadas = Array.isArray(response?.afectado) ? response.afectado : [];

        if (medidasIdentificadas.length > 0) {
          // Agregar cada medida una por una como medida emergente
          this.agregarMedidasEmergentesIndividualmente(medidasIdentificadas, afectadoId);
        } else {
          console.log('No se encontraron medidas identificadas para este afectado');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar medidas identificadas:', error);
      }
    });
  }

  private agregarMedidasEmergentesIndividualmente(medidas: any[], afectadoId: number) {
    // Procesar cada medida identificada y agregarla como medida emergente
    medidas.forEach((medida, index) => {
      const medidaEmergente = {
        idAfectado: afectadoId,
        idMedida: medida.idMedida || medida.id || null,
        medida: medida.medida || medida.descripcion || '',
        periodo: medida.periodo || '', // Se puede dejar vacío para que el usuario lo complete
        observaciones: medida.observaciones || 'Medida agregada automáticamente desde medidas identificadas'
      };

      // Agregar la medida emergente usando el servicio
      this.medidasService.agregarMedidasEmergentes(medidaEmergente).subscribe({
        next: (response) => {
          console.log(`Medida emergente ${index + 1} agregada exitosamente:`, response);
        },
        error: (error: any) => {
          console.error(`Error al agregar medida emergente ${index + 1}:`, error);
        }
      });
    });

    console.log(`Se procesaron ${medidas.length} medidas identificadas para agregar como medidas emergentes`);
  }

  /**
   * Obtiene las medidas emergentes por afectado y las almacena en el array
   */
  obtenerMedidasEmergentesPorAfectado(): void {
    if (!this.medidasEmergentesForm.get('idAfectado')?.value) {
      console.warn('No se puede obtener medidas emergentes: ID de afectado no disponible');
      return;
    }

    this.medidasService.getMedidasEmergentes(this.medidasEmergentesForm.get('idAfectado')?.value).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.medidasEmergentesArray = response.data;
          console.log('Medidas emergentes obtenidas y almacenadas:', this.medidasEmergentesArray);
        } else {
          console.warn('Respuesta inesperada del servicio:', response);
          this.medidasEmergentesArray = [];
        }
      },
      error: (error) => {
        console.error('Error al obtener medidas emergentes por afectado:', error);
        this.medidasEmergentesArray = [];
      }
    });
  }

}
