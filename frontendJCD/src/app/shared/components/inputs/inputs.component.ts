import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-inputs',
  templateUrl: './inputs.component.html',
  imports: [CommonModule,ReactiveFormsModule]

})
export class InputsComponent implements OnInit {

  @Input() label!: string;
   @Input() control!: FormControl;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() containerClass: string = '';




  ngOnInit() {
  }

   get isInvalid(): boolean {
    return !!(this.control?.invalid && this.control?.touched);
  }

}
export default InputsComponent;
