import { Component } from '@angular/core';
import { NnaLayoutHeaderComponent } from "@nna/layout/component/header/nna-layout-header.component";
import { RouterOutlet } from '@angular/router';
import { MujeresLayoutContentComponent } from "./component/content/mujeres-layout-content.component";
import { SidebarComponent } from "./component/sidebar/mujeres-layout-sidebar-component";
import MujeresLayoutHeaderComponent from './component/header/mujeres-layout-header.component';

@Component({
  selector: 'mujeres-layout',

  imports: [MujeresLayoutHeaderComponent, MujeresLayoutContentComponent, SidebarComponent],
  templateUrl: './mujeres-layout.component.html',

})
export class MujeresLayoutComponent {

}
export default MujeresLayoutComponent;
