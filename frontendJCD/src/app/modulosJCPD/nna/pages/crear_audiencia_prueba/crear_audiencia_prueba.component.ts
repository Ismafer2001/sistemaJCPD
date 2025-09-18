import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';


@Component({
  selector: 'app-crear_audiencia_prueba',
  templateUrl: './crear_audiencia_prueba.component.html',
  imports:[CommonModule,CardFormComponent,TablaEditComponent]

})
export class Crear_audiencia_pruebaComponent implements OnInit {
   currentTab:string ='0'

  constructor() { }

  ngOnInit() {
  }


  //---------------------------OTROS-------------------//
   cambiarTab(tab: string) {
    this.currentTab = tab;
  }

}
export default Crear_audiencia_pruebaComponent;
