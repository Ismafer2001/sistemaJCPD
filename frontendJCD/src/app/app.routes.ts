import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guards';
import { grupoValidoGuard } from '@shared/guards/grupos_validos.guards';

import { AdminGuard } from '@shared/guards/rol.guards copy';

export const routes: Routes = [

  {
    path: '',
    canActivate: [authGuard],
    loadChildren:() => import('@inicio/routes/inicio.routes')
  },

  {

    path: 'mujeres',
    canActivate: [authGuard,],
    loadChildren: () => import('@mujeres/routes/mujeres.routes'),
  },
  
  {

    path: 'login',

    loadComponent: () => import('@auth/pages/login/auth-page-login.component'),
  },
  {
    path: 'admin',
    canActivate: [authGuard,AdminGuard],

    loadChildren: () => import('@admin/routes/admin.routes'),
  },
  {

    path: ':grupo',
    canActivate: [authGuard,grupoValidoGuard],
    loadChildren: () => import('@nna/routes/nna.routes'),
  },
  {
  path: '**',
   loadComponent: () => import('@auth/pages/login/auth-page-login.component'), // o loadComponent: () => import('./404.component')
}









];
