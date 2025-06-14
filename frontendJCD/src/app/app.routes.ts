import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guards';
import { rolGuard } from '@shared/guards/rol.guard';

export const routes: Routes = [

  {
    path: '',
    canActivate: [authGuard,rolGuard('princial')],
    loadChildren:() => import('@inicio/routes/inicio.routes')
  },
  {

    path: 'nna',
    canActivate: [authGuard,rolGuard('principal')],
    loadChildren: () => import('@nna/routes/nna.routes'),
  },
  {

    path: 'auth',

    loadChildren: () => import('@auth/routes/auth.routes'),
  },
  {
    path: 'admin',
    canActivate: [authGuard,rolGuard('admin')],

    loadChildren: () => import('@admin/routes/admin.routes'),
  },









];
