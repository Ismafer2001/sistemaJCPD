import { Component } from '@angular/core';

import { NnaLayoutContentComponent } from "./component/content/nna-layout-content.component";
import { SidebarComponent } from "./component/sidebar/nna_layout_sidebar_component";
import { headerComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'nna-layout',

  imports: [headerComponent, NnaLayoutContentComponent, SidebarComponent],
  templateUrl: './nna_layout.component.html',

})
export class NnaLayoutComponent {


}
export default NnaLayoutComponent;
