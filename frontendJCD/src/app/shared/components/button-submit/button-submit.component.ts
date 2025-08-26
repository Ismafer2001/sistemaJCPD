import { Component,  Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-button-submit',
  templateUrl: './button-submit.component.html',

})
export class ButtonSubmitComponent  {

@Input() label: string = 'Botón';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() color: 'submit' | 'afirmar' | 'cancelar'|'error' = 'submit';

  @Input() disabled: boolean = false;
  @Input() routerlink: string | undefined;

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }

  getColorClasses() {
    switch (this.color) {
      case 'submit':
        return 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2';
      case 'afirmar':
        return 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2';
      case 'cancelar':
        return 'px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 disabled:opacity-50 flex items-center gap-2';
      case 'error':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';

    }
  }


}
export default ButtonSubmitComponent;
