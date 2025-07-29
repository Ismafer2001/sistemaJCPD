import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-Form',
  templateUrl: './card-Form.component.html',

})
export class CardFormComponent implements OnInit {
  @Input() titulo=""

  constructor() { }

  ngOnInit() {
  }

}
