import { Routes } from '@angular/router';

const nnaReportes: Routes = [

    {path: '',
    loadComponent: () => import('@nna/pages/reportes-nna/reportes-nna.component')},


      {
        path:'denuncias-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/denuncia_reporte/denuncia_reporte.component')


      },
      {
        path:'avocatorias-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/avocatoria_reporte/avocatoria_reporte.component')
      },
      {
        path:'citaciones-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/citaciones_reporte/citaciones_reporte.component')
      },
      {
        path:'notificaciones-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/notificaciones-reporte/notificaciones-reporte.component')
      },
      {
        path:'audiencia-contestacion-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/audiencia-constestacion-reportes/audiencia-constestacion-reportes.component')
      },
      {
        path:'audiencia-pruebas-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/audiencia-pruebas-reportes/audiencia-pruebas-reportes.component')
      },
      {
        path:'resoluciones-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/resoluciones-reporte/resoluciones-reporte.component')
      },
      {
        path:'seguimiento-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/seguimiento-reporte/seguimiento-reporte.component')
      },
      {
        path:'impugnacion-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/impugnacion-reporte/impugnacion-reporte.component')
      },
      {
        path:'desestimiento-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/desestimiento_reporte/desestimiento_reporte.component')
      },
      {
        path:'cierre-reporte',
        loadComponent:()=>
          import('@nna/pages/reportes-nna/reportes/cierre-reporte/cierre-reporte.component')
      }


];
export default nnaReportes;
