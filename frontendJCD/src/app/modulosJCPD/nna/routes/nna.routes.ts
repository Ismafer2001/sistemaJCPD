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
        path:'detalle-vocatoria/:id',
        loadComponent:()=>
          import('@nna/pages/fases/pages/avocatoriaDetalles/avocatoriaDetalles.component')


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


      },
      {
        path:'audienciaDeContestacion/:id',
        loadComponent:()=>
          import('@nna/pages/crear_audiencia_contestacion/crear_audiencia_contestacion.component')


      },
      {
        path:'audienciaDePruebas/:id',
        loadComponent:()=>
          import('@nna/pages/crear_audiencia_prueba/crear_audiencia_prueba.component')


      },
      {
        path:'resoluciones/:id',
        loadComponent:()=>
          import('@nna/pages/crear_resoluciones/crear_resoluciones.component')


      },
      {
        path:'seguimiento/:id',
        loadComponent:()=>
          import('@nna/pages/anexar_seguimiento/anexar_seguimiento.component')


      },
      {
        path:'impugnacion/:id',
        loadComponent:()=>
          import('@nna/pages/control_impugnacion/control_impugnacion.component')


      },
      {
        path:'cierreDeCaso/:id',
        loadComponent:()=>
          import('@nna/pages/cierre_caso/cierre_caso.component')


      },
      {
        path: 'reportes-nna',
        loadChildren: () =>
          import('@nna/routes/reportes.routes')
      },




    ],
  },
];
export default nnaRoutes;
