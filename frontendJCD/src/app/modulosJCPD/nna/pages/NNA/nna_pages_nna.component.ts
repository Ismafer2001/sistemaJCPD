import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DenunciaService, } from "@nna/services/denuncia.service";
import { Denuncia } from "@nna/interfaces/denuncia.interface";
import { HttpErrorResponse } from "@angular/common/http";
import TablaComponent from "@shared/components/tabla/tabla.component";
import { AuthService } from "@auth/services/auth.service";
import { CardFormComponent } from "@shared/components/card-Form/card-Form.component";

@Component({
  selector: 'nna-page-nna',
  standalone: true,
  imports: [RouterLink, CommonModule, TablaComponent, CardFormComponent ],
  templateUrl: './nna_page_nna.component.html',
})
export class NnaPageNnaComponent implements OnInit {
  denuncias: Denuncia[] = [];
  denunciasActivas= 0
   idCAnton:number =0
  loading: boolean = false;
  error: string | null = null;

  constructor(private denunciaService: DenunciaService, private AuthService:AuthService) {

  }

  ngOnInit(): void {

    this.cargarDenuncias();
    this.totalDenunciasActivas();

  }






  /////------------------CARGAR DATOS----------------------------///

  cargarDenuncias(): void {
    console.log('Cargando denuncias...');
    this.loading = true;
    this.error = null;
    this.denunciaService.obtenerTodasDenuncias().subscribe({
      next: (data) => {
        console.log('Denuncias recibidas:', data);
        this.denuncias = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al cargar denuncias:', error);
        this.error = error.error?.message || 'Error al cargar las denuncias';
        this.loading = false;
      },
      complete: () => {
        console.log('Carga de denuncias completada');
      }
    });
  }

  //------------------------------OTROS------------------//


   totalDenunciasActivas(){
    this.denunciaService.contarDenunciasActivas().subscribe(n=>{
      this.denunciasActivas=n.total;
    })
  }
  eliminarDenuncia(denuncia:Denuncia){

        this.denunciaService.eliminarDenuncia(denuncia.idDenuncia).subscribe(() => this.cargarDenuncias());

  }
}

export default NnaPageNnaComponent;
