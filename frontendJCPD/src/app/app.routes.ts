//contiene documentacion importante
import { Routes } from '@angular/router';
import { authGuard } from '@shared/guards/auth.guards';
import { grupoValidoGuard } from '@shared/guards/grupos_validos.guards';
import { AdminGuard } from '@shared/guards/rol.guards copy';
import { NoAdminGuard } from '@shared/guards/no-admin.guard';

export const routes: Routes = [

  {
    path: '',//ruta de inicio con lazy load
    canActivate: [authGuard, NoAdminGuard], //guards para proteccin de rutas
    loadChildren:() => import('@inicio/routes/inicio.routes')// la ruta @inicio la configuramos en el tsconfing al igual que las otras de abajo
  },
  {
    path: 'login', //ruta de login
    loadComponent: () => import('@auth/pages/login/auth-page-login.component'),
  },
  {
    path: 'admin', //ruta de solo administrador
    canActivate: [authGuard,AdminGuard],

    loadChildren: () => import('@admin/routes/admin.routes'),
  },
  {
/*---el path es u parametro que solo acepta como grupo nna,mujeres y adultos
 revisar el Guard GrupoValidoGuard*/
 /*--esto se hizo para un cambio dinamico de formulario entre  un mismo componente
 dependiendo el grupo*/
 /*--debido a problemas del alcance a futuro puede que esto ya no sea asi y las
  rutas de mujeres y adultos hagan por separado*/
  /*por lo cual debria para la ruta a nna y revisar todos los componentes relacionados
   a nna ya que hay funciones que extraen el paramtro de la URL */

    path: ':grupo',//cambiar a rutas individuales de ser necesario
    canActivate: [authGuard, NoAdminGuard, grupoValidoGuard],
    loadChildren: () => import('@nna/routes/nna.routes'),
  },
  /*AGREGAR Si necesitas las rutas de los otros mudulos si se van hacer por separado
   ejemplo */
   /*path: 'nna',
    canActivate: [authGuard, NoAdminGuard,],
    loadChildren: () => import('@nna/routes/nna.routes'),
  },path: 'mujeres',
    canActivate: [authGuard, NoAdminGuard, ],
    loadChildren: () => import('@nna/routes/nna.routes'),
  },path: 'adultos',
    canActivate: [authGuard, NoAdminGuard, ],
    loadChildren: () => import('@nna/routes/nna.routes'),
  }, */
  {
  path: '**',
   loadComponent: () => import('@auth/pages/login/auth-page-login.component'), // o loadComponent: () => import('./404.component')
}









];
