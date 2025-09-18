import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { authInterceptor } from './app/shared/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { errorInterceptor } from '@shared/interceptors/error.interceptor';
import { appConfig } from 'app/app.config';


registerLocaleData(localeEs);




bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
