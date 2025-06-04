import { Component, OnInit } from '@angular/core';
import { AuthLayoutContentComponent } from './component/content/auth_layout_content.component';
import { AuthLayoutHeaderComponent } from './component/header/auth_layout_header.component';
@Component({
  selector: 'app-auth_layout',
  templateUrl: './auth_layout.component.html',
  imports: [ AuthLayoutHeaderComponent, AuthLayoutContentComponent]
  
})
export class AuthLayoutComponent{


}
export default AuthLayoutComponent;