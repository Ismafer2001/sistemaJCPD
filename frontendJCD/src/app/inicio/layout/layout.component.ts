import { Component } from '@angular/core';
import { InicioLayoutHeaderComponent } from "./components/inicio-layout-header/inicio-layout-header.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  
  imports: [InicioLayoutHeaderComponent,RouterOutlet],
  templateUrl: './layout.component.html',
  
})
export class LayoutComponent {

}
export default LayoutComponent;
