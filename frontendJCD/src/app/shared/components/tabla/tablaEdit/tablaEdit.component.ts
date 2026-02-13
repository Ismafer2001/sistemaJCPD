
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-tablaEdit',
  templateUrl: './tablaEdit.component.html',
  imports: [CommonModule]
})
export class TablaEditComponent  {

  @Input() columnas: string[] = [];
  @Input() encabezados: string[] = [];
  @Input() datos: any[] = [];
  @Input() acciones: boolean = false;
  @Input() mostrarEditar = false;
  @Input() botonEstado: boolean = false;
  @Input() isLoading: boolean = false;
@Input() emptyMessage: string = 'No se encontraron registros';
@Input() loadingMessage: string = 'Cargando datos...';

  @Input() estado: (user: any) => void = () => {};
  @Input() eliminar: (item: any) => void = () => {};
  @Input() editar: (item: any) => void = () => {};

      @Input() descargar: (item: any) => void = () => {};




  constructor() {}



  obtenerValorAnidado(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
  }
}
export default TablaEditComponent;
