import { Routes } from '@angular/router';

export const nnaRoutes: Routes = [
  {
    path: '',

    loadComponent: () => import('@nna/layout/nna_layout.component'),
    children: [
      {
        path: 'ninos',

        loadComponent: () => import('@nna/pages/NNA/nna_pages_nna.component'),
      },
      {
        path: 'ninos/crearDenuncia',

        loadComponent: () =>
          import('@nna/pages/crear_denuncia/nna_page_crearDenuncia.component'),
      },
    ],
  },
];
export default nnaRoutes;
