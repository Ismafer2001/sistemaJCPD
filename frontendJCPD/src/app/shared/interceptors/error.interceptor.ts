import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorModalService } from '@shared/services/error-modal.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorModalService = inject(ErrorModalService);

  //console.log('Interceptando la solicitud HTTP:', req);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error capturado por el interceptor:', error);

      // Extraer mensaje del servidor
      const serverMessage = error.error?.message || error.message || error.statusText;

      // Mostrar modal específico según el tipo de error
      if (error.status === 403) {
        errorModalService.show403Modal(serverMessage);
      }

      return throwError(() => error.error.message || error.message);
    })
  );
};
