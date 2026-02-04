import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';



import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { appConfig } from 'app/app.config';


registerLocaleData(localeEs);




bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
