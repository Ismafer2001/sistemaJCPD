import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InhibirseService, Canton } from '@nna/services/inhibirse.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth/services/auth.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-inhibirse',
  templateUrl: './inhibirse.component.html',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class InhibirseComponent implements OnInit {
  inhibirseForm: FormGroup = new FormGroup({});
  cantones: Canton[] = [];
  denunciaId: number = 0;
  grupo: string = '';

  constructor(
    private route: ActivatedRoute,
    private inhibirseService: InhibirseService,
    private fb: FormBuilder,
    private AuthService: AuthService
  ) { }

  ngOnInit() {
    const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';
    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url
      this.denunciaId = +params['id'];
    });

    // Inicializar formulario
    this.initializeForm();
    this.cantonActualUsuario();

    // Cargar cantones
    this.cargarCantones();
    this.inhibirseForm.valueChanges.subscribe(value => {
      console.log('Formulario actualizado:', value);
    })
  }

  initializeForm() {
    this.inhibirseForm = this.fb.group({
      idCantonDestino: ['', Validators.required],
      idCantonOrigen: ['', Validators.required],
      idDenuncia: [this.denunciaId, Validators.required],
      codigoTramite: [''],

      motivoDeInhibirse: ['', Validators.required]
    });
  }

  cargarCantones() {
    this.inhibirseService.obtenerCantones().subscribe({
      next: (cantones) => {
        this.cantones = cantones;
      },
      error: (error) => {
        console.error('Error al cargar cantones:', error);
      }
    });
  }

  cantonActualUsuario(){
    this.AuthService.getUsuarioActual().subscribe(user => {
     this.inhibirseForm.patchValue({
      idCantonOrigen: user.id_canton
     })
    });
    this.inhibirseService.getCodigoTramite(this.denunciaId).subscribe(data=>{

      this.inhibirseForm.patchValue({
      codigoTramite: data.codigoTramite
     })

    })


  }

  onSubmit() {
   if (this.inhibirseForm.invalid) {
               this.inhibirseForm.markAllAsTouched();
               toast.error('Formulario inválido', {
                 duration: 3000,
                 description: 'Por Favor, Completa Todos los Campos Requeridos'
               });
               return;
             }
                const body ={
       ...this.inhibirseForm.value,

     };
       this.inhibirseService.IniciarInhibirse(body).subscribe({
         next: (response) => {
           toast.success('denuncia remitida con exito', {
             duration: 3000
           });
         },
         error: (error) => {
           toast.error('Error al remitir la denuncia', {
             duration: 3000
           });
         }
       });
  }

}
export default InhibirseComponent;
