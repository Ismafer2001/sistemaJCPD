import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DesestimientoService } from '@nna/services/desestimiento.service';
import { ButtonSubmitComponent } from '@shared/components/button-submit/button-submit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-control_desestimiento',
  templateUrl: './control_desestimiento.component.html',
  imports: [CardFormComponent,
     FormsModule,
      ButtonSubmitComponent,
       ReactiveFormsModule,
      RouterLink,
    CommonModule],

})
export class Control_desestimientoComponent implements OnInit {
  controlDesestimientoForm!: FormGroup;
  denunciaId!:number;

  constructor(
    private fb: FormBuilder,
     private route: ActivatedRoute,
     private desestimientoService: DesestimientoService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      this.loadDatosDenuncia();
    });

    this.formularioControlDesestimiento();

    this.controlDesestimientoForm.valueChanges.subscribe(value => {
      console.log(value);
    });
  }

  formularioControlDesestimiento() {
    this.controlDesestimientoForm = this.fb.group({
      codigoTramite: ['', Validators.required],
      resultado_desestimiento: ['', Validators.required],
      idDenuncia: [this.denunciaId]
    });
  }

  loadDatosDenuncia() {
   console.log(this.denunciaId)
    this.desestimientoService.getCodigoTramite(this.denunciaId).subscribe(data=>{
      this.controlDesestimientoForm.patchValue({
        codigoTramite: data.codigoTramite,
        idDenuncia: data.idDenuncia
      })

      console.log(data);
    });
  }

  crearControlDesestimiento() {
    if (this.controlDesestimientoForm.invalid) {
      this.controlDesestimientoForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        duration: 3000,
        description: 'Por favor, completa todos los campos requeridos'
      });
      return;
    }

    const body = {
      ...this.controlDesestimientoForm.value
    };

    console.log('Datos del desestimiento:', body);

   this.desestimientoService.postControlDesestimiento(body).subscribe({
      next: (response) => {
        toast.success('Control de Desestimiento creado con éxito', {
          duration: 3000
        });
      },
      error: (error) => {
        toast.error('Error al crear el Control de Desestimiento', {
          duration: 3000
        });
      }
    });
  }

}
export default Control_desestimientoComponent;
