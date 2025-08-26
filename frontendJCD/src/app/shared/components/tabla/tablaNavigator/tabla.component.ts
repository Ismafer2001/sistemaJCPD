import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'tablaNavigator',
  imports: [CommonModule],
  templateUrl: './tabla.component.html',

})
export class TablaNavigatorComponent {
  @Input() columnas:string[]=[];
@Input() encabezados:string[]=[];
@Input() datos:any[]=[];
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
export default TablaNavigatorComponent;
