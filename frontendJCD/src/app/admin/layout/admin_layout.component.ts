import { Component, OnInit } from '@angular/core';
import { AdminLayoutContentComponent } from './component/content/admin_layout_content.component';
import { AdminLayoutHeaderComponent } from './component/header/admin_layout_header.component';
import { SidebarComponentAdmin } from "./component/sidebar/admin_sidebar.component";
@Component({
  selector: 'app-admin_layout',
  templateUrl: './admin_layout.component.html',
  imports: [AdminLayoutHeaderComponent, AdminLayoutContentComponent, SidebarComponentAdmin]

})
export class AuthLayoutComponent{


}
export default AuthLayoutComponent;
