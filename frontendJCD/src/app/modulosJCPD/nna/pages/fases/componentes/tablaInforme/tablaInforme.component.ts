
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tablaInforme',
  templateUrl: './tablaInforme.component.html',

})
export class TablaInformeComponent {
 @Input() columnas:string[]=[];
@Input() encabezados:string[]=[];
@Input() datos:any[]=[];

@Input() RouterLink:string=""
@Input() RouterLinkparam:string=""
@Input() queryParams?: string[]

  @Input() eliminar: (item: any) => void = () => {};
  @Input() editar: (item: any) => void = () => {};


constructor(private router: Router) {}

obtenerValorAnidado(obj: any, path: string): any {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
}


navegar(item: any) {


  if (this.RouterLink && this.RouterLinkparam) {

    const param = item[this.RouterLinkparam];
    const paramEditar = item['id'];

    if (param !== undefined) {
      this.router.navigate([this.RouterLink, param,'editar',paramEditar]);
    }
  }
}

}
