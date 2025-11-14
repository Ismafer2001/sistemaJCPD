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

  @Input() eliminar: (item: any) => void = () => {};
  @Input() editar: (item: any) => void = () => {};

  @Output() asistioChange = new EventEmitter<{item: any, index: number, value: boolean}>();
  @Output() justificoChange = new EventEmitter<{item: any, index: number, value: boolean}>();



  constructor() { }
   // Maneja el cambio del checkbox de asistencia de forma segura
  onCheckboxChange(event: Event, item: any, index: number) {
    const checked = (event.target as HTMLInputElement).checked;
    this.asistioChange.emit({ item, index, value: checked });
  }

  // Maneja el cambio del checkbox de justificación
  onJustificoChange(event: Event, item: any, index: number) {
    const checked = (event.target as HTMLInputElement).checked;
    this.justificoChange.emit({ item, index, value: checked });
  }


  obtenerValorAnidado(obj: any, path: string): any {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
  }

}

export default CumpleMedidasTablaComponent;
