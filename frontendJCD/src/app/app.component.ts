import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSonnerToaster } from 'ngx-sonner';


@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NgxSonnerToaster],

  templateUrl: './app.component.html',

})
export class AppComponent {

}
