// ...existing code...
// ...existing code...
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tablaEdit',
  templateUrl: './tablaEdit.component.html',
  imports: [CommonModule]
})
export class TablaEditComponent  {
  @Input() mostrarAsistio: boolean = false;
  @Input() columnas: string[] = [];
  @Input() encabezados: string[] = [];
  @Input() datos: any[] = [];
  @Input() acciones: boolean = false;
  @Input() mostrarEditar = false;
  @Input() botonEstado: boolean = false;
  @Input() estado: (user: any) => void = () => {};
  @Input() eliminar: (item: any) => void = () => {};
  @Input() editar: (item: any) => void = () => {};

  @Output() asistioChange = new EventEmitter<{item: any, index: number, value: boolean}>();


  constructor(private router: Router) {}

  // Maneja el cambio del checkbox de asistencia de forma segura
  onCheckboxChange(event: Event, item: any, index: number) {
    const checked = (event.target as HTMLInputElement).checked;
    this.asistioChange.emit({ item, index, value: checked });
  }

  obtenerValorAnidado(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
  }
}
export default TablaEditComponent;
