import { Component } from '@angular/core';

import AdultosLayoutContentComponent from "./component/content/adultos-layout-content.component";
import { SidebarComponent } from "./component/sidebar/adultos-layout-sidebar-component";
import AdultosLayoutHeaderComponent from './component/header/adultos-layout-header.component';
import headerComponent from '@shared/components/header/header.component';


@Component({
  selector: 'adultos-layout',

  imports: [AdultosLayoutHeaderComponent, AdultosLayoutContentComponent, SidebarComponent,headerComponent],
  templateUrl: './adultosM-layout.component.html',

})
export class AdultosLayoutComponent {

}
export default AdultosLayoutComponent;
