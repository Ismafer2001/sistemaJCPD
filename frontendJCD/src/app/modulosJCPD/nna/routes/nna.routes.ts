import { Routes } from '@angular/router';

export const nnaRoutes: Routes = [
  {
    path: '',

    loadComponent: () => import('@nna/layout/nna_layout.component'),
    children: [
      {
        path: '',

        loadComponent: () => import('@nna/pages/NNA/nna_pages_nna.component'),
      },
      {
        path: 'crearDenuncia',

        loadComponent: () =>
          import('@nna/pages/crear_denuncia/nna_page_crearDenuncia.component'),
      },
      {
        path:'fases/:id',
        loadComponent:()=>
          import('@nna/pages/fases/nna_page_fases.component')


      },
      {
        path:'avocatoria/:id',
        loadComponent:()=>
          import('@nna/pages/crearAvocatoria/crearAvocatoria.component')


      },
      {
        path:'notificaciones/:id',
        loadComponent:()=>
          import('@nna/pages/crear-Notificaciones/crear-Notificaciones.component')


      },
      {
        path:'citaciones/:id',
        loadComponent:()=>
          import('@nna/pages/crear-citaciones/crear-citaciones.component')


      }
    ],
  },
];
export default nnaRoutes;
