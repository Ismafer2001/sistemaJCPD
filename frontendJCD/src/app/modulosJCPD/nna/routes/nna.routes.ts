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
        path:'inhibicion/:id',
        loadComponent:()=>
          import('@nna/pages/fases/pages/inhibirse/inhibirse.component')


      },
      {
        path:'informes/:id',
        loadComponent:()=>
          import('@nna/pages/fases/pages/Crear_informe/Crear_informe.component')


      },
      {
        path:'informes/:id/:modo',
        loadComponent:()=>
          import('@nna/pages/fases/pages/Crear_informe/formatoinforme/formatoinforme.component')


      },
      {
        path:'informes/:id/:modo/:idinforme',
        loadComponent:()=>
          import('@nna/pages/fases/pages/Crear_informe/formatoinforme/formatoinforme.component')


      },

      {
        path:'avocatoria/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crearAvocatoria/crearAvocatoria.component')


      },
      {
        path:'providencia/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/crear_providencia/crear_providencia.component')


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
        path:'notificaciones/:id/formulario',
        loadComponent:()=>
          import('@nna/pages/crear-Notificaciones/pages/formato-notificacion/formato-notificacion.component')


      },
      {
        path:'citaciones/:id',
        loadComponent:()=>
          import('@nna/pages/crear-citaciones/crear-citaciones.component')


      },
      {
        path:'citaciones/:id/formulario',
        loadComponent:()=>
          import('@nna/pages/crear-citaciones/pages/formato-citacion/formato-citacion.component')


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
        path:'desestimiento/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/control_desestimiento/control_desestimiento.component')


      },
      {
        path:'cierreDeCaso/:modo/:id',
        loadComponent:()=>
          import('@nna/pages/cierre_caso/cierre_caso.component')


      },
      {
        path: 'denuncia-remitidas',
        loadComponent: () =>
          import('@nna/pages/denuncias-remitidas/denuncias-remitidas.component')
      },
      {
        path: 'denuncia-remitidas/:id',
        loadComponent: () =>
          import('@nna/pages/denuncias-remitidas/informacionDenunciaRemitidas/informacionDenunciaRemitidas.component')
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
