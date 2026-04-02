import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-filtro',
  templateUrl: './filtro.component.html',
  imports: [ReactiveFormsModule],

})
export class FiltroComponent implements OnInit {
  @Input() filtroForm!: FormGroup;
  @Input() filtrar!: () => void;

  constructor() { }

  ngOnInit() {
  }

}
export default FiltroComponent;
