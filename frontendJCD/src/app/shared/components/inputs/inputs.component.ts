import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {  FormControl,  ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-inputs',
  templateUrl: './inputs.component.html',
  imports: [CommonModule,ReactiveFormsModule]

})
export class InputsComponent  {

  @Input() label!: string;
   @Input() control!: FormControl;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() containerClass: string = '';






   get isInvalid(): boolean {
    return !!(this.control?.invalid && this.control?.touched);
  }

}
export default InputsComponent;
