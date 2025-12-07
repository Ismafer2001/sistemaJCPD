import { Component, EventEmitter, Input,  Output } from '@angular/core';

@Component({
  selector: 'app-cumpleMedidasTabla',
  templateUrl: './cumpleMedidasTabla.component.html',

})
export class CumpleMedidasTablaComponent  {

 @Input() columnas: string[] = [];
  @Input() encabezados: string[] = [];
  @Input() datos: any[] = [];
  @Input() acciones: boolean = false;
  @Input() mostrarEditar = false;
  @Input() botonEstado: boolean = false;
  
  // Nuevas propiedades para descarga PDF
  @Input() mostrarDescargaPdf: boolean = false;
  @Input() columnaPdfNombre: string = 'archivo'; // Nombre de la columna que contiene el nombre del archivo
  @Input() textoPdfBoton: string = 'Descargar PDF'; // Texto personalizable del botón
  @Input() iconoPdf: string = 'fas fa-download'; // Ícono personalizable

  @Input() eliminar: (item: any) => void = () => {};
  @Input() editar: (item: any) => void = () => {};
  @Input() descargarPdf: (nombreArchivo: string) => void = () => {}; // Nueva función para descarga





  constructor() { }



  obtenerValorAnidado(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
  }

}

export default CumpleMedidasTablaComponent;
