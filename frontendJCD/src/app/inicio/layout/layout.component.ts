import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { headerComponent } from '@shared/header/header.component';

@Component({
  selector: 'app-layout',

  imports: [headerComponent,RouterOutlet],
  templateUrl: './layout.component.html',

})
export class LayoutComponent {
  moduloActual: string = 'JUNTA CANTONAL DE PROTECCION DE DERECHOS';




}
export default LayoutComponent;
