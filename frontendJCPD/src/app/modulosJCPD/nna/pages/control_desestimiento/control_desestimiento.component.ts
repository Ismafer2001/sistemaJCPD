import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  idDesestimiento!:number
  loading: boolean = false; // Loader principal para guardar
  loadingMessage: string = ''; // Mensaje del loader principal
  editMode=false;

  constructor(
    private fb: FormBuilder,
     private route: ActivatedRoute,
     private desestimientoService: DesestimientoService,
     private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      if (params['modo'] === 'editar') {
        this.editMode = true;
      }
      this.loadDatosDenuncia();
    });

    this.formularioControlDesestimiento();

    this.controlDesestimientoForm.valueChanges.subscribe(n=>{
      console.log(n)
    })


  }

  formularioControlDesestimiento() {
    this.controlDesestimientoForm = this.fb.group({
      codigoTramite: ['', Validators.required],
      resultado_desestimiento: ['', Validators.required],
      idDenuncia: [this.denunciaId],
      idDesestimiento:['']
    });
  }

  loadDatosDenuncia() {

    this.desestimientoService.getCodigoTramite(this.denunciaId).subscribe(data=>{
    this.idDesestimiento= data.idDesestimiento

      this.controlDesestimientoForm.patchValue({
        codigoTramite: data.codigoTramite,
        idDenuncia: data.idDenuncia,
        idDesestimiento: data.idDesestimiento

      })
      if(this.editMode){
      this.loadDesestimientoEditMode(this.idDesestimiento)
    }
    });


  }
  loadDesestimientoEditMode(id:number){
    console.log('aquiiiii',id)
    this.desestimientoService.getControlDesestimiento(id).subscribe(data=>{
      this.controlDesestimientoForm.patchValue({
        codigoTramite: data.codigoTramite,
        idDenuncia: data.idDenuncia,
        idDesestimiento: data.id,
        resultado_desestimiento :data.resultado_desestimiento

      })



    })
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

    // Activar loader
    this.loading = true;
    this.loadingMessage = 'Guardando control de desestimiento...';

    const body = {
      ...this.controlDesestimientoForm.value
    };



   this.desestimientoService.postControlDesestimiento(body).subscribe({
      next: (response) => {
        this.loading = false; // Desactivar loader
        this.router.navigate(['../../editar/'+ this.denunciaId], { relativeTo: this.route });
        toast.success('Control de Desestimiento creado con éxito', {
          duration: 3000
        });
      },
      error: (error) => {
        this.loading = false; // Desactivar loader
        toast.error('Error al crear el Control de Desestimiento', {
          duration: 3000
        });
      }
    });
  }

}
export default Control_desestimientoComponent;
