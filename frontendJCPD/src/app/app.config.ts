import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from '@shared/interceptors/error.interceptor';
import { authInterceptor } from '@shared/interceptors/auth.interceptor';



export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideHttpClient(withInterceptors([errorInterceptor, authInterceptor])),

    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'top',
           // 👈 vuelve al inicio al cambiar de ruta
        anchorScrolling: 'enabled'          // opcional: soporta anclas tipo #seccion
      }))]
};
