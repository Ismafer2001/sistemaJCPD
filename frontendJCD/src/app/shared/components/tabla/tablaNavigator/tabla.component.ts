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

@Input() RouterLink:string=""
@Input() RouterLinkparam:string=""
@Input() queryParams?: string[]
 @Input() acciones: boolean = false;

  @Input() eliminar: (item: any) => void = () => {};
  @Input() editar: (item: any) => void = () => {};


constructor(private router: Router) {}

obtenerValorAnidado(obj: any, path: string): any {
  if (!obj || !path) return null;
  return path.split('.').reduce((acc, prop) => acc?.[prop], obj);
}

tabs(item:any){
  const tab = item[this.RouterLinkparam];


  if ( this.RouterLinkparam && this.queryParams) {
    const param = item[this.RouterLinkparam];
    const queryParams ={idUsuario: item[this.queryParams[0]],estado: item[this.queryParams[1]],parte: item[this.queryParams[2]],idNotificacion: item[this.queryParams[3]]}
    console.log('params'+queryParams)
    if (param !== undefined) {
      this.router.navigate([this.RouterLink, param,'formulario',{idUsuario:queryParams.idUsuario,estado:queryParams.estado,parte:queryParams.parte,idformulario:queryParams.idNotificacion}]);
    }

  }


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
