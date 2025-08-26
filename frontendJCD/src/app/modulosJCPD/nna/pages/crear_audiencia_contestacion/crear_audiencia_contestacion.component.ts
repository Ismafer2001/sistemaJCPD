import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import TablaComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { AdminLayoutComponent } from "../../../../admin/layout/admin_layout.component";

@Component({
  selector: 'app-crear_audiencia',
  templateUrl: './crear_audiencia_contestacion.component.html',
  imports: [CommonModule, CardFormComponent, TablaComponent]


})
export class Crear_audienciaComponent implements OnInit {

  currentTab:string ='0'

  constructor() { }

  ngOnInit() {
  }


//---------------------------OTROS-------------------//
   cambiarTab(tab: string) {
    this.currentTab = tab;
  }

}

export default Crear_audienciaComponent
