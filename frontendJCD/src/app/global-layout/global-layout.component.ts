import { Component } from '@angular/core';
import { headerComponent } from "../shared/header/header.component";

@Component({
  selector: 'app-global-layout',
  imports: [headerComponent],
  templateUrl: './global-layout.component.html',

})
export class GlobalLayoutComponent {

}
