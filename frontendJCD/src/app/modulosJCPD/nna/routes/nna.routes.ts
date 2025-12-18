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
        path: 'denuncia/:modo/:id',

        loadComponent: () =>
          import('@nna/pages/crear_denuncia/nna_page_crearDenuncia.component'),
      },
      {
        path: 'denuncia/:modo',

        loadComponent: () =>
          import('@nna/pages/crear_denuncia/nna_page_crearDenuncia.component'),
      },

      {
        path:'fases/:id',
        loadComponent:()=>
          import('@nna/pages/fases/nna_page_fases.component')


      },
      {
        path:'avocatoria/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crearAvocatoria/crearAvocatoria.component')


      },
      {
        path:'detalle-vocatoria/:id',
        loadComponent:()=>
          import('@nna/pages/fases/pages/avocatoriaDetalles/avocatoriaDetalles.component')


      },
      {
        path:'notificaciones/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crear-Notificaciones/crear-Notificaciones.component')


      },
      {
        path:'citaciones/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crear-citaciones/crear-citaciones.component')


      },
      {
        path:'audienciaDeContestacion/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crear_audiencia_contestacion/crear_audiencia_contestacion.component')


      },
      {
        path:'audienciaDePruebas/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crear_audiencia_prueba/crear_audiencia_prueba.component')


      },

      {
        path:'resoluciones/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crear_resoluciones/crear_resoluciones.component')


      },
      {
        path:'seguimiento/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/anexar_seguimiento/anexar_seguimiento.component')


      },
      {
        path:'impugnacion/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/control_impugnacion/control_impugnacion.component')


      },
      {
        path:'cierreDeCaso/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/cierre_caso/cierre_caso.component')


      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('@nna/routes/reportes.routes')
      },




    ],
  },
];
export default nnaRoutes;
