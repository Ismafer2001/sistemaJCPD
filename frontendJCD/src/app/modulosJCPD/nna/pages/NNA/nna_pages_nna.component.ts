import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DenunciaService, } from "@nna/services/denuncia.service";
import { Denuncia } from "@nna/interfaces/denuncia.interface";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'nna-page-nna',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nna_page_nna.component.html',
})
export class NnaPageNnaComponent implements OnInit {
  denuncias: Denuncia[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private denunciaService: DenunciaService) {}

  ngOnInit(): void {
    console.log('Iniciando componente...');
    this.cargarDenuncias();
  }

  cargarDenuncias(): void {
    console.log('Cargando denuncias...');
    this.loading = true;
    this.error = null;

    this.denunciaService.obtenerTodasDenuncias().subscribe({
      next: (data: Denuncia[]) => {
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
}

export default NnaPageNnaComponent;
