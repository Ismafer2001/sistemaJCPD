import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';


bootstrapApplication(AppComponent, {

  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ],
});

/*bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));*/
