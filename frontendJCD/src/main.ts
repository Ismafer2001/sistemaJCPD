import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { authInterceptor } from './app/shared/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';


registerLocaleData(localeEs);

  
bootstrapApplication(AppComponent, {

  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes)
  ],
});

/*bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));*/
