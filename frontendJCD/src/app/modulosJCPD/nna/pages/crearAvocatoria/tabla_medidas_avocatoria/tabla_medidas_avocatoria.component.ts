import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabla_medidas_avocatoria',
  templateUrl: './tabla_medidas_avocatoria.component.html',

})
export class Tabla_medidas_avocatoriaComponent  {

  @Input() columnas:string[]=[];
@Input() encabezados:string[]=[];
@Input() datos:any[]=[];
@Input() acciones:boolean=false
@Input() botonEstado:boolean=false
@Input() estado:(user: any) => void = () => {};
@Input() eliminar:(item: any) => void = () => {};
@Input() editar:(item: any) => void = () => {};
@Input() cambiar:(item: any) => void = () => {};

@Input() RouterLink:string=""
@Input() RouterLinkparam:string=""


constructor() {}

obtenerValorAnidado(obj: any, path: string): any {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
}





}
