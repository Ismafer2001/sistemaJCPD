import { Routes } from '@angular/router';

export const inicioRoutes: Routes = [
    {
        path: '',

        loadComponent: () => import('@inicio/layout/layout.component'),
        children: [
          {
            path: '',

            loadComponent: () =>
              import('@inicio/page/inicio-page-home.component'),
          },
          {
            path: 'perfil',

            loadComponent: () =>
              import('@inicio/page/perfil/perfil.component'),
          },
        ],
      },



];
export default inicioRoutes;
