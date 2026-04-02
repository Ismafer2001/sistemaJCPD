import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute} from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
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
  imports: [ CommonModule, ReactiveFormsModule, TablaNavigatorComponent, CardFormComponent, ButtonSubmitComponent,CardFormComponent, PaginacionComponent ],
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
  grupo: string = "";

  // Propiedades para el filtro
  filtroForm!: FormGroup;
  filtroSeleccionado: string = '';
  opcionesFiltro = [
    { value: 'codigoTramite', label: 'Código de Trámite' },
    { value: 'nombre', label: 'Nombre del Afectado' },
    { value: 'cedula', label: 'Cédula del Afectado' }
  ];

  // Configuración de grupos válidos
  private gruposValidos = ['nna', 'adultos', 'mujeres'];

  constructor(private denunciaService: DenunciaService,
     private UserService:UserService,
    private route:ActivatedRoute,
    private fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const grupo = params['grupo'];
      if (this.gruposValidos.includes(grupo)) {
        this.grupo = grupo;
      } else {
        console.error('Grupo no válido:', grupo);
        // No asignar valor por defecto, dejarlo vacío o manejar el error
        this.grupo = '';
      }
    });

    this.cargarDenuncias();
    this.totalDenunciasActivas();
    this.principalesActivos();

    // Inicializar formulario de filtros
    this.initFiltroForm();

  }

  // when using server-side pagination, `denuncias` already contains the current page
  get pagedDenuncias(): Denuncia[] {
    return this.denuncias;
  }






  /////------------------CARGAR DATOS----------------------------///

  cargarDenuncias(page: number = this.currentPage, search?: string, searchBy?: string): void {

    this.loading = true;
    this.error = null;
    this.denunciaService.obtenerDenunciasPaginadas(this.grupo, page, this.pageSize, search, searchBy).subscribe({
      next: (resp) => {

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

    // Mantener la búsqueda activa si hay un filtro aplicado
    const valorBusqueda = this.filtroForm.get('valorBusqueda')?.value?.trim();
    const tipoFiltro = this.filtroForm.get('tipoFiltro')?.value;

    const searchParam = (tipoFiltro && valorBusqueda) ? valorBusqueda : undefined;
    const searchByParam = (tipoFiltro && valorBusqueda) ? tipoFiltro : undefined;

    // solicitar la página al servidor
    this.cargarDenuncias(p, searchParam, searchByParam);
  }

  // Métodos para el filtro
  initFiltroForm(): void {
    this.filtroForm = this.fb.group({
      tipoFiltro: [''],
      valorBusqueda: [{ value: '', disabled: true }]
    });

    // Escuchar cambios en el tipo de filtro
    this.filtroForm.get('tipoFiltro')?.valueChanges.subscribe(valor => {
      this.filtroSeleccionado = valor;
      if (valor) {
        this.filtroForm.get('valorBusqueda')?.enable();
        this.filtroForm.get('valorBusqueda')?.setValue('');
      } else {
        this.filtroForm.get('valorBusqueda')?.disable();
        this.filtroForm.get('valorBusqueda')?.setValue('');
        // Solo recargar si no estamos ya en proceso de limpiar
        if (this.currentPage !== 1 || this.denuncias.length === 0) {
          this.cargarDenuncias(1);
        }
      }
    });
  }

  aplicarFiltro(): void {
    const tipoFiltro = this.filtroForm.get('tipoFiltro')?.value;
    const valorBusqueda = this.filtroForm.get('valorBusqueda')?.value?.trim();

    if (!tipoFiltro || !valorBusqueda) {
      this.limpiarFiltro();
      return;
    }

    // Enviar tanto el valor de búsqueda como el tipo de filtro al backend
    this.currentPage = 1; // Resetear a la primera página
    this.cargarDenuncias(this.currentPage, valorBusqueda, tipoFiltro);
  }

  limpiarFiltro(): void {
    // Usar patchValue para evitar disparar los listeners innecesariamente
    this.filtroForm.patchValue({
      tipoFiltro: '',
      valorBusqueda: ''
    });

    // Deshabilitar el campo de búsqueda
    this.filtroForm.get('valorBusqueda')?.disable();

    // Resetear variables de control
    this.filtroSeleccionado = '';
    this.currentPage = 1;

    // Recargar todas las denuncias sin filtros
    this.cargarDenuncias(1);
  }

  onBusquedaKeyUp(event: any): void {
    if (event.key === 'Enter') {
      this.aplicarFiltro();
    }
  }

  getPlaceholderText(): string {
    switch (this.filtroSeleccionado) {
      case 'codigoTramite':
        return 'Ingrese el código de trámite...';
      case 'cedula':
        return 'Ingrese la cédula del afectado...';
      case 'nombre':
        return 'Ingrese el nombre o apellido del afectado...';
      default:
        return 'Seleccione un filtro primero...';
    }
  }

  //------------------------------OTROS------------------//


   totalDenunciasActivas(){
    this.denunciaService.contarDenunciasActivas(this.grupo).subscribe(n=>{
      this.denunciasActivas=n.total;
    })
  }
  principalesActivos(){
    this.UserService.usuariosActivos().subscribe(n=>{
      this.miembrosPrincipales=n;
      
    })
  }

  eliminarDenuncia(denuncia:Denuncia){

        this.denunciaService.eliminarDenuncia(denuncia.idDenuncia).subscribe(() => this.cargarDenuncias());

  }
}

export default NnaPageNnaComponent;
