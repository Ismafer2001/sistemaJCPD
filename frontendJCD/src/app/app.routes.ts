import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guards';

import { AdminGuard } from '@shared/guards/rol.guards copy';

export const routes: Routes = [

  {
    path: '',
    canActivate: [authGuard],
    loadChildren:() => import('@inicio/routes/inicio.routes')
  },
  {

    path: 'nna',
    canActivate: [authGuard],
    loadChildren: () => import('@nna/routes/nna.routes'),
  },
  {

    path: 'mujeres',
    canActivate: [authGuard,],
    loadChildren: () => import('@mujeres/routes/mujeres.routes'),
  },
  {

    path: 'adultos',
    canActivate: [authGuard,],
    loadChildren: () => import('@adultos/routes/adultosM.routes'),
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









];
