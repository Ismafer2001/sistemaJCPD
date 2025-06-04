import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guards';
import { adminGuard } from '@shared/guards/isAdminauth.guards';
import { notadminGuard } from '@shared/guards/notAdmin.guards';

export const routes: Routes = [

  {
    path: '',
    canActivate: [authGuard,notadminGuard],
    loadChildren:() => import('@inicio/routes/inicio.routes')
  },
  {

    path: 'nna',
    canActivate: [authGuard,notadminGuard],
    loadChildren: () => import('@nna/routes/nna.routes'),
  },
  {

    path: 'auth',

    loadChildren: () => import('@auth/routes/auth.routes'),
  },
  {
    path: 'admin',
    canActivate: [authGuard,adminGuard],

    loadChildren: () => import('@admin/routes/admin.routes'),
  },









];
