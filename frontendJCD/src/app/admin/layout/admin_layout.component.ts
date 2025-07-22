import { Component } from '@angular/core';
import { AdminLayoutContentComponent } from './component/content/admin_layout_content.component';
import { SidebarComponentAdmin } from "./component/sidebar/admin_sidebar.component";
import { headerComponent } from "../../shared/components/header/header.component";

@Component({
  selector: 'app-admin_layout',
  templateUrl: './admin_layout.component.html',
  imports: [ AdminLayoutContentComponent, SidebarComponentAdmin, headerComponent]

})
export class AdminLayoutComponent{




}
export default AdminLayoutComponent;
