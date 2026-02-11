import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-tablapruebas',
  templateUrl: './tablaprubeas.component.html',
  imports: [CommonModule]

})
export class TablaprubeasComponent {
 @Input() columnas: string[] = [];
  @Input() encabezados: string[] = [];
  @Input() datos: any[] = [];
  @Input() acciones: boolean = false;
  @Input() mostrarEditar = false;
  @Input() botonEstado: boolean = false;
  @Input() estado: (user: any) => void = () => {};
  @Input() eliminar: (item: any) => void = () => {};
  @Input() editar: (item: any) => void = () => {};
  @Output() archivoDescarga = new EventEmitter<any>();

  descargarArchivo(archivoInfo: any): void {
    this.archivoDescarga.emit(archivoInfo);
  }

  obtenerValorAnidado(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
  }

}
export default TablaprubeasComponent;
