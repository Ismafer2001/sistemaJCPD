import { CommonModule } from '@angular/common';
import { Component, Input, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fases-card',
  templateUrl: './fases-card.component.html',
  imports:[CommonModule,RouterLink]

})
export class FasesCardComponent implements OnInit {
@Input() titulo:string='';
@Input() estatus:string='';
@Input() estatusFaseAnterior:string='';
@Input() link:string='';
@Input() idDenuncia:string='';
@Input() linkDetalles:string='';
@Input() queryParams:boolean=false;

  constructor() { }

  ngOnInit() {
  }

}
export default FasesCardComponent;
