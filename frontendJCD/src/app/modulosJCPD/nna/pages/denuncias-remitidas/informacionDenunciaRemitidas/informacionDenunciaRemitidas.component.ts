import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InhibirseService } from '@nna/services/inhibirse.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { ButtonSubmitComponent } from '@shared/components/button-submit/button-submit.component';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-informacionDenunciaRemitidas',
  templateUrl: './informacionDenunciaRemitidas.component.html',
  imports: [ RouterLink,  CardFormComponent, ReactiveFormsModule, ButtonSubmitComponent,CommonModule]

})
export class InformacionDenunciaRemitidasComponent implements OnInit {
  grupo: string = '';
  deprecatoriaID: number = 0;
  deprecatoriaForm!: FormGroup;
  cantones: any[] = [];
  denunciaId: string = '';
  estadoRecepcion: string = 'pendiente';

  constructor(private route: ActivatedRoute,
              private inhibirseService: InhibirseService,
              private fb: FormBuilder,
              private router: Router
  ) {



  }

  ngOnInit() {
    const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';
    this.formulario();
     this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.deprecatoriaID = +params['id'];
      this.denunciaId = params['id'];
      console.log('ID de la deprecatoria:', this.deprecatoriaID);

      // Cargar los datos de la deprecatoria
      this.loadDatosDeprecatoria(this.deprecatoriaID);

    });
  }

  formulario(){
    this.deprecatoriaForm = this.fb.group({
      cantonOrigen: ['', Validators.required],
      motivoDeInhibirse: ['', Validators.required]
    });

  }

 loadDatosDeprecatoria(idDeprecatoria: number) {
    this.inhibirseService.getDeprecatoriasById(idDeprecatoria).subscribe({
      next: (data) => {
        console.log('Datos de la deprecatoria:', data);
         this.estadoRecepcion = data.estadoRecepcion;

        // Hacer patchValue del formulario con los datos obtenidos
        this.deprecatoriaForm.patchValue({
          cantonOrigen: data.cantonOrigen.nombre || '',
          motivoDeInhibirse: data.motivoDeInhibirse
        });
      },
      error: (error) => {
        console.error('Error al cargar los datos de la deprecatoria:', error);
      }
    });
 }


  onAceptar() {
    this.inhibirseService.putAceptarDeprecatoria(this.deprecatoriaID).subscribe({
      next: (response) => {
        console.log('Deprecatoria aceptada exitosamente:', response);
        this.estadoRecepcion = 'aceptada';
        toast.success('Deprecatoria aceptada con éxito', {
          duration: 3000,
          position: 'top-right'
        });
        this.router.navigate([this.grupo]);


      },
      error: (error) => {
        console.error('Error al aceptar la deprecatoria:', error);
        toast.error('Error al aceptar la deprecatoria', {
          duration: 3000,
          position: 'top-right'
        });
      }
    });
  }

  onRechazar() {
    // Aquí podrías agregar un servicio putRechazarDeprecatoria cuando esté disponible
    console.log('Deprecatoria rechazada');
    this.estadoRecepcion = 'rechazada';
    toast.warning('Deprecatoria rechazada', {
      duration: 3000,
      position: 'top-right'
    });
  }

}
export default InformacionDenunciaRemitidasComponent;
