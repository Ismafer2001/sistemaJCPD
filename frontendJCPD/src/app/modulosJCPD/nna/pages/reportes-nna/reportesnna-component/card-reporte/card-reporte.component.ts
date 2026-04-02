import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-reporte',
  templateUrl: './card-reporte.component.html',
  imports: [RouterLink],

})
export class CardReporteComponent implements OnInit {
  @Input() title: string= '';
  @Input() description: string = '';
  @Input() icon: string = '';
  @Input() link: string = '';


  constructor() { }

  ngOnInit() {
  }

}
export default CardReporteComponent;
