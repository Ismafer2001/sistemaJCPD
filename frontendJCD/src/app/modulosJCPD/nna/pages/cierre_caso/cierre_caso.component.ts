import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';

@Component({
  selector: 'app-cierre_caso',
  templateUrl: './cierre_caso.component.html',
  imports:[CommonModule,CardFormComponent]

})
export class Cierre_casoComponent implements OnInit {
   currentTab:string ='0'

  constructor() { }

  ngOnInit() {
  }

  //---------------------------OTROS-------------------//
   cambiarTab(tab: string) {
    this.currentTab = tab;
  }

}
export default Cierre_casoComponent;
