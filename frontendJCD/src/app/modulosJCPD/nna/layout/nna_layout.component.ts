import { Component } from '@angular/core';
import { NnaLayoutHeaderComponent } from "@nna/layout/component/header/nna-layout-header.component";
import { RouterOutlet } from '@angular/router';
import { NnaLayoutContentComponent } from "./component/content/nna-layout-content.component";
import { SidebarComponent } from "./component/sidebar/nna_layout_sidebar_component";

@Component({
  selector: 'nna-layout',

  imports: [NnaLayoutHeaderComponent, NnaLayoutContentComponent, SidebarComponent],
  templateUrl: './nna_layout.component.html',

})
export class NnaLayoutComponent {

}
export default NnaLayoutComponent;
