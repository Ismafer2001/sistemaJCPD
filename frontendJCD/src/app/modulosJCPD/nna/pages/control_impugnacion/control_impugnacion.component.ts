import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ControlImpugnacionService } from '@nna/services/controlImpugnacion.service';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-control_impugnacion',
  templateUrl: './control_impugnacion.component.html',
  imports: [CardFormComponent,
     FormsModule,
      ButtonSubmitComponent,
       ReactiveFormsModule,
      RouterLink],

})
export class Control_impugnacionComponent implements OnInit {
  controlInpugnacionForm!: FormGroup;
  denunciaId!:number;
  loading: boolean = false; // Loader principal para guardar
  loadingMessage: string = ''; // Mensaje del loader principal

  constructor(private fb: FormBuilder,
     private route: ActivatedRoute,
     private controlImpugnacionService: ControlImpugnacionService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      this.loadDatosResolucion();
    });

    this.formularioControlImpugnacion();

    this.controlInpugnacionForm.valueChanges.subscribe(value => {
      console.log(value);
    });
  }

  formularioControlImpugnacion() {
    this.controlInpugnacionForm = this.fb.group({
      codigoTramite: [''],
      recurso_impugnacion: [''],
      idResolucion:[this.denunciaId],
      resolucionImpugnada: [''],
      periodo: [''],
      resultado: [''],
      // Define los controles del formulario aquí
    });
  }

  loadDatosResolucion() {
    console.log(this.denunciaId)
    this.controlImpugnacionService.getCodigoTramite(this.denunciaId).subscribe(data=>{
      this.controlInpugnacionForm.patchValue({
        codigoTramite: data.codigoTramite,
        idResolucion: data.idResolucion
      })

      console.log(data);
    });
  }

  crearControlImpugnacion() {
    if (this.controlInpugnacionForm.invalid) {
            this.controlInpugnacionForm.markAllAsTouched();
            toast.error('Formulario inválido', {
              duration: 3000,
              description: 'Por Favor, Completa Todos los Campos Requeridos'
            });
            return;
          }

          // Activar loader
          this.loading = true;
          this.loadingMessage = 'Guardando control de impugnación...';

             const body ={
    ...this.controlInpugnacionForm.value,

  };
    this.controlImpugnacionService.postControlImpugnacion(body).subscribe({
      next: (response) => {
        this.loading = false; // Desactivar loader
        toast.success('Control de Impugnación creado con éxito', {
          duration: 3000
        });
      },
      error: (error) => {
        this.loading = false; // Desactivar loader
        toast.error('Error al crear el Control de Impugnación', {
          duration: 3000
        });
      }
    });
  }


}
export default Control_impugnacionComponent;
