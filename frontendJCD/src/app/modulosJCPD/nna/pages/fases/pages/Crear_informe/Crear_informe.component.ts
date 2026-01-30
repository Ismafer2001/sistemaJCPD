import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import InputsComponent from '@shared/components/inputs/inputs.component';
import { TablaInformeComponent } from '../../componentes/tablaInforme/tablaInforme.component';
import { InformesService } from '@nna/services/informes.service';

@Component({
  selector: 'app-Crear_informe',
  templateUrl: './Crear_informe.component.html',
   imports: [CardFormComponent,
     TablaInformeComponent,
     
      CommonModule,
      ReactiveFormsModule,
       FormsModule,

      RouterLink]

})
export class Crear_informeComponent implements OnInit {

 denunciaId = 0;
    grupo:string = ''

  // Propiedades para la tabla
  columnasTabla: string[] = ['id','diriguidoA'];
  encabezadosTabla: string[] = ['id','Nombre'];
  datosTabla: any[] = [];

  constructor(private route:ActivatedRoute,
     private router:Router,
    private fb:FormBuilder,
  private informesService: InformesService) { }

  ngOnInit() {
     const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';

    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];
      this.cargarInformes();
    });
  }

  // Método para navegar a crear informe
  crearInforme(): void {
    this.router.navigate([`../../informes`, this.denunciaId,'crear' ], { relativeTo: this.route });
  }

  // Método para cargar los informes existentes
  cargarInformes(): void {
    console.log('Cargando informes para denunciaId:', this.denunciaId);
    this.informesService.obtenerInformesPorDenuncia(this.denunciaId).subscribe(data => {
      this.datosTabla = data;
    });
  }

  // Método para editar informe
  editarInforme(item: any): void {
    console.log('Editar informe:', item);
    this.router.navigate(['/informes', this.denunciaId, 'editar', item.id]);
  }

  // Método para eliminar informe
  eliminarInforme(item: any): void {
    console.log('Eliminar informe:', item);
    if (confirm(`¿Está seguro de eliminar el informe "${item.titulo}"?`)) {
      // Aquí iría la lógica para eliminar del backend
      this.datosTabla = this.datosTabla.filter(informe => informe.id !== item.id);
      console.log('Informe eliminado');
    }
  }

}
export default Crear_informeComponent;
