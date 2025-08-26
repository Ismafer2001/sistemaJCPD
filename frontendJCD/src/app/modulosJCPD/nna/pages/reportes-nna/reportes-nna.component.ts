import { Component, OnInit } from '@angular/core';

import CardReporteComponent from './reportesnna-component/card-reporte/card-reporte.component';


@Component({
  selector: 'app-reportes-nna',
  templateUrl: './reportes-nna.component.html',
  imports: [CardReporteComponent],

})
export class ReportesNnaComponent implements OnInit {
  opcionesDeReporte = [
  {
    title: 'Denuncia',
    description: 'Reporte de denuncias registradas',
    icon: 'alert-circle',
    link: 'denuncias-reporte'
  },
  {
    title: 'Avocatorias',
    description: 'Avocatorias realizadas en los casos',
    icon: 'file-signature',
    link: 'avocatorias-reporte'
  },
  {
    title: 'Citaciones',
    description: 'Resumen de citaciones emitidas',
    icon: 'mail',
    link: 'citaciones-reporte'
  },
  {
    title: 'Notificaciones',
    description: 'Detalle de notificaciones entregadas',
    icon: 'bell',
    link: 'notificaciones-reporte'
  },
  {
    title: 'Audiencia de Contestación',
    description: 'Audiencias para presentar contestaciones',
    icon: 'users',
    link: 'audiencia-contestacion-reporte'
  },
  {
    title: 'Audiencia de Pruebas',
    description: 'Audiencias de presentación de pruebas',
    icon: 'file-search',
    link: 'audiencia-pruebas-reporte'
  },
  {
    title: 'Resoluciones',
    description: 'Resoluciones emitidas por la Junta',
    icon: 'file-text',
    link: 'resoluciones-reporte'
  },
  {
    title: 'Seguimiento',
    description: 'Acciones de seguimiento en los casos',
    icon: 'activity',
    link: 'seguimiento-reporte'
  },
  {
    title: 'Impugnación',
    description: 'Casos con procesos de impugnación',
    icon: 'rotate-ccw',
    link: 'impugnacion-reporte'
  },
  {
    title: 'Cierre de Caso',
    description: 'Cierres formales de expedientes',
    icon: 'check-circle',
    link: 'cierre-reporte'
  }
];

  constructor() { }

  ngOnInit() {
  }

}
export default ReportesNnaComponent;
