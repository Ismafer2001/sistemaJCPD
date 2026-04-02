import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonSubmitComponent } from '../button-submit/button-submit.component';

export interface ModalConfig {
  titulo: string;
  descripcion?: string;
  mostrarInput?: boolean;
  placeholderInput?: string;
}

@Component({
  selector: 'shared-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonSubmitComponent],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnInit, AfterViewInit {
  @ViewChild('modalDialog') dialog!: ElementRef<HTMLDialogElement>;

  @Input() config: ModalConfig = {
    titulo: 'Modal',
  };
  @Input() valor = '';
  @Input() mensajeError = ''; // Para mostrar errores debajo del input

  // Eventos
  @Output() valorChange = new EventEmitter<string>();
  @Output() mensajeErrorChange = new EventEmitter<string>();
  @Output() confirmado = new EventEmitter<string>();
  @Output() cancelado = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
    // Establecer valores por defecto para propiedades faltantes
    this.config = {
      descripcion: '',
      ...this.config
    };
  }

  ngAfterViewInit() {
    // Mostrar el modal automáticamente cuando se inicializa
    this.mostrarModal();

    // Escuchar el evento close del dialog
    this.dialog.nativeElement.addEventListener('close', () => {
      const returnValue = this.dialog.nativeElement.returnValue;
      if (returnValue === 'confirm') {
        // No hacer nada aquí, ya se manejó en confirmar()
      } else {
        // Se cerró sin confirmar (ESC, backdrop, cancel)
        this.cancelado.emit();
      }
    });
  }

  mostrarModal() {
    this.dialog.nativeElement.showModal();
  }

  // Método para manejar cambios en el input
  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valor = target.value;
    this.valorChange.emit(this.valor);
  }

  confirmar() {
    this.confirmado.emit(this.valor);
    // No cerrar automáticamente - el componente padre decide si cerrar según el resultado
  }

  // Método público para cerrar el modal desde el componente padre
  cerrarModal() {
    this.dialog.nativeElement.close('confirm');
  }

  cancelar() {
    this.cancelado.emit();
    this.dialog.nativeElement.close('cancel');
  }
}
