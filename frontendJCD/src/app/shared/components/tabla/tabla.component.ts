import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'global-tabla',
  imports: [CommonModule],
  templateUrl: './tabla.component.html',

})
export class TablaComponent {
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


constructor(private router: Router) {}

obtenerValorAnidado(obj: any, path: string): any {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
}

tabs(item:any){
  const tab = item[this.RouterLinkparam];
  this.cambiar(tab)

}

navegar(item: any) {
  if (this.RouterLink && this.RouterLinkparam) {
    const param = item[this.RouterLinkparam];
    if (param !== undefined) {
      this.router.navigate([this.RouterLink, param]);
    }
  }

}


}
export default TablaComponent;
