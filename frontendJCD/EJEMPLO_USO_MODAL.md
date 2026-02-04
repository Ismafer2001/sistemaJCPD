// EJEMPLO DE USO DEL MODAL EN UN COMPONENTE ESPECÍFICO
// Por ejemplo, en login.component.ts o cualquier otro componente donde lo necesites

import { Component, ViewChild } from '@angular/core';
import { ModalAccesoDenegadoComponent } from '@shared/components/modalAccesoDenegado/modalAccesoDenegado.component';
import { ErrorModalService } from '@shared/services/error-modal.service';

@Component({
  selector: 'app-ejemplo-uso-modal',
  standalone: true,
  imports: [ModalAccesoDenegadoComponent], // Importar el modal
  template: `
    <!-- Tu contenido del componente -->
    <button (click)="mostrarErrorAcceso()">Simular Error de Acceso</button>
    <button (click)="mostrarErrorServidor()">Simular Error de Servidor</button>

    <!-- Modal - Solo incluirlo en los componentes donde lo necesites -->
    <app-modalAccesoDenegado #errorModal></app-modalAccesoDenegado>
  `
})
export class EjemploUsoModalComponent {
  @ViewChild('errorModal') errorModal!: ModalAccesoDenegadoComponent;

  constructor(private errorModalService: ErrorModalService) {}

  // Ejemplo 1: Mostrar error de acceso denegado
  mostrarErrorAcceso(): void {
    const error = this.errorModalService.createAccessDeniedError(
      'No tienes permisos para acceder a esta sección.'
    );
    this.errorModal.showModal(error);
  }

  // Ejemplo 2: Mostrar error de servidor
  mostrarErrorServidor(): void {
    const error = this.errorModalService.createServerError(
      'El servidor no está respondiendo. Intenta más tarde.'
    );
    this.errorModal.showModal(error);
  }

  // Ejemplo 3: Manejar errores de HTTP automáticamente
  hacerPeticionHTTP(): void {
    this.miServicio.getData().subscribe({
      next: (data) => {
        // Manejar datos exitosos
      },
      error: (httpError) => {
        // Crear mensaje de error basado en el tipo de error
        let error;

        switch (httpError.status) {
          case 401:
            error = this.errorModalService.createUnauthorizedError();
            break;
          case 403:
            error = this.errorModalService.createAccessDeniedError(
              httpError.error?.message
            );
            break;
          case 404:
            error = this.errorModalService.createNotFoundError();
            break;
          case 500:
            error = this.errorModalService.createServerError();
            break;
          default:
            error = this.errorModalService.createErrorMessage(
              'Error',
              httpError.error?.message || 'Ha ocurrido un error inesperado',
              httpError.status
            );
        }

        this.errorModal.showModal(error);
      }
    });
  }
}
