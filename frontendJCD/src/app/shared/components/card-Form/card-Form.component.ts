import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-Form',
  templateUrl: './card-Form.component.html',

})
export class CardFormComponent  {
  @Input() titulo=""

  constructor() { }



}
