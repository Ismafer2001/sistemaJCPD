import { Component,  Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule,RouterLink],
  selector: 'app-button-submit',
  templateUrl: './button-submit.component.html',

})
export class ButtonSubmitComponent  {

@Input() label: string = 'Botón';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() color: 'submit' | 'afirmar' | 'cancelar'|'accion' |'error' = 'submit';
  @Input() icon: string = ''; // Nuevo input para el icono

  @Input() loading: boolean = false; // Para estado de carga
  @Input() loadingText: string = '';

  @Input() disabled: boolean = false;
  @Input() link: string[] | undefined;

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }

  getColorClasses() {
    const baseClasses = 'w-30 h-10 px-3 font-medium rounded-md text-base text-left leading-tight transition-colors duration-200 flex items-center justify-center  disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed';

    switch (this.color) {
      case 'submit':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500`;
      case 'afirmar':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500`;
      case 'cancelar':
        return `${baseClasses} bg-gray-500 text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-500`;
      case 'accion':
        return `${baseClasses} bg-amber-300 text-black hover:bg-amber-400 focus:ring-2 focus:ring-amber-300`;
      case 'error':
        return `${baseClasses} bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500`;
      default:
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500`;
    }
  }


}
export default ButtonSubmitComponent;
