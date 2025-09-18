import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DenunciaService, } from "@nna/services/denuncia.service";
import { Denuncia } from "@nna/interfaces/denuncia.interface";
import { HttpErrorResponse } from "@angular/common/http";
import TablaNavigatorComponent from "@shared/components/tabla/tablaNavigator/tabla.component";
import PaginacionComponent from '@shared/components/paginacion/paginacion.component';

import { CardFormComponent } from "@shared/components/card-Form/card-Form.component";
import ButtonSubmitComponent from "@shared/components/button-submit/button-submit.component";
import { UserService, Usuario } from "@admin/services/user.service";

@Component({
  selector: 'nna-page-nna',
  standalone: true,
  imports: [ CommonModule, TablaNavigatorComponent, CardFormComponent, ButtonSubmitComponent,RouterLink,CardFormComponent, PaginacionComponent ],
  templateUrl: './nna_page_nna.component.html',
})
export class NnaPageNnaComponent implements OnInit {
  denuncias: Denuncia[] = [];
  denunciasActivas= 0
  miembrosPrincipales: Usuario[] = [];
  idCAnton:number =0
  loading: boolean = false;
  error: string | null = null;
  // pagination
  currentPage = 1;
  pageSize = 5;
  // total items from server
  totalDenuncias = 0;

  constructor(private denunciaService: DenunciaService, private UserService:UserService) {

  }

  ngOnInit(): void {

    this.cargarDenuncias();
    this.totalDenunciasActivas();
    this.principalesActivos()

  }

  // when using server-side pagination, `denuncias` already contains the current page
  get pagedDenuncias(): Denuncia[] {
    return this.denuncias;
  }






  /////------------------CARGAR DATOS----------------------------///

  cargarDenuncias(page: number = this.currentPage): void {

    this.loading = true;
    this.error = null;
    this.denunciaService.obtenerDenunciasPaginadas('nna', page, this.pageSize).subscribe({
      next: (resp) => {
        console.log('Denuncias paginadas recibidas:', resp);
        this.denuncias = resp.data || [];
        this.totalDenuncias = resp.total || 0;
        this.currentPage = resp.page || page;
        this.pageSize = resp.limit || this.pageSize;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar denuncias paginadas:', error);
        this.error = error.error?.message || 'Error al cargar las denuncias';
        this.loading = false;
      },
      complete: () => {
        console.log('Carga de denuncias completada');
      }
    });
  }

  onPageChange(page: number | any) {
    const p = Math.max(1, Number(page) || 1);
    // solicitar la página al servidor
    this.cargarDenuncias(p);
  }

  //------------------------------OTROS------------------//


   totalDenunciasActivas(){
    this.denunciaService.contarDenunciasActivas('nna').subscribe(n=>{
      this.denunciasActivas=n.total;
    })
  }
  principalesActivos(){
    this.UserService.usuariosActivos().subscribe(n=>{
      this.miembrosPrincipales=n;
      console.log('Miembros principales:', this.miembrosPrincipales);
    })
  }

  eliminarDenuncia(denuncia:Denuncia){

        this.denunciaService.eliminarDenuncia(denuncia.idDenuncia).subscribe(() => this.cargarDenuncias());

  }
}

export default NnaPageNnaComponent;
