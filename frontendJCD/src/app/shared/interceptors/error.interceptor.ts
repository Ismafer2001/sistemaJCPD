import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Interceptando la solicitud HTTP:', req);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error capturado por el interceptor:', error);

      return throwError(() => error.error.message);
    })
  );
};
