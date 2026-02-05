import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink,} from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { NotificacionService } from '@nna/services/notificacion.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import  TablaNavigatorComponent from '@shared/components/tabla/tablaNavigator/tabla.component';
import { ButtonSubmitComponent } from "../../../../shared/components/button-submit/button-submit.component";

import { toast } from 'ngx-sonner';
import InputsComponent from '@shared/components/inputs/inputs.component';



interface involucrados{
  nombres: string;
  parte: string;
  idUsuario?: number;
}

@Component({
  selector: 'app-crear-Notificaciones',
  templateUrl: './crear-Notificaciones.component.html',
  imports: [CardFormComponent,
     TablaNavigatorComponent,
     InputsComponent,
      CommonModule,
      ReactiveFormsModule,
       FormsModule,
        ButtonSubmitComponent,
      RouterLink]
})


export class CrearNotificacionesComponent implements OnInit {


  involucradosPrincipales: involucrados[] = [];
   otrosInvolucrados: involucrados[] = [];

  // Estados de loading para las tablas
  loadingInvolucradosPrincipales: boolean = false;
  loadingOtrosInvolucrados: boolean = false;

  denunciaId = 0;
  nuevoNotificadoForm!: FormGroup;
  nuevaInstitucionForm!: FormGroup;


  tipoNotificado: 'persona' | 'Representante Institucional' | '' = '';

  idNotificacion!: number;

  grupo:string =''
  modoEdicionNotificados: boolean = false;
  itemEnEdicion: any = null;




  constructor(private notificacionServices:NotificacionService,
     private route:ActivatedRoute,
     private router:Router,
    private fb:FormBuilder,
     ) {}

  ngOnInit() {
     const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';

    this.route.params.subscribe(params => {   ///<-----suscirbmos para obtener paramtro de la url

      this.denunciaId = +params['id'];
    });
    this.formularioNotificadosPersona()
    this.formularioNotificadosinstituciones()

    this.loadInvolucradosPrincipales(this.denunciaId)
    this.loadOtrosInvolucrados(this.denunciaId);

     this.nuevoNotificadoForm.get('idDenuncia')?.setValue(this.denunciaId);
      this.nuevaInstitucionForm.get('idDenuncia')?.setValue(this.denunciaId);
     console.log('tiponotificado seleccionado: ', this.tipoNotificado)

     this.nuevoNotificadoForm.valueChanges.subscribe((n) => {
      console.log('Valor del formulario de persona:', n);
     })




  }

  //----------------------FORMULARIOS-------------------------//

  formularioNotificadosPersona(){
    this.nuevoNotificadoForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      tipoParticipante: ['Otros', Validators.required],

      idDenuncia: [this.denunciaId]
    });
  }
  formularioNotificadosinstituciones(){
    this.nuevaInstitucionForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      institucion: ['', Validators.required],
      cargo: ['', Validators.required],
      tipoParticipante: ['Representante Institucional', Validators.required],

      idDenuncia: [this.denunciaId]
    });
  }

  eliminarNotificado(item: any){
    if (confirm('¿Estás seguro de que deseas eliminar este notificado?')) {
      this.notificacionServices.deleteOtroNotificado(item.idUsuario).subscribe({
        next: (response) => {
          console.log('Notificado eliminado exitosamente:', response);
          toast.success('Notificado eliminado correctamente');

          // Recargar ambas listas para reflejar los cambios
          this.loadInvolucradosPrincipales(this.denunciaId);
          this.loadOtrosInvolucrados(this.denunciaId);
        },
        error: (error) => {
          console.error('Error al eliminar notificado:', error);
          toast.error('Error al eliminar el notificado');
        }
      });
    }
  }
  seleccionarParaEditarNotificado(item: any){
    this.modoEdicionNotificados = true;
    this.itemEnEdicion = item;

    // Determinar el tipo basado en el tipoParticipante
    if (item.parte === 'Representante Institucional') {
      this.tipoNotificado = 'Representante Institucional';

      // Rellenar formulario de institución
      this.nuevaInstitucionForm.patchValue({
        nombres: item.nombres || '',
        apellidos: item.apellidos || '',
        cedula: item.cedula || '',
        institucion: item.institucion || '',
        cargo: item.cargo || '',
        tipoParticipante: item.parte,
        idDenuncia: this.denunciaId
      });
      this.nuevoNotificadoForm.valueChanges.subscribe((n) => {
        console.log('Valor del formulario de institución:', n);
      })

    } else {
      this.tipoNotificado = 'persona';

      // Rellenar formulario de persona
      this.nuevoNotificadoForm.patchValue({
        nombres: item.nombres || '',
        apellidos: item.apellidos || '',
        cedula: item.cedula || '',
        tipoParticipante: item.parte,
        idDenuncia: this.denunciaId
      });
    }

    console.log('Editando notificado:', item);
    console.log('Tipo seleccionado:', this.tipoNotificado);
  }



  //--------------------CARGA DE DATOS------------//

  loadInvolucradosPrincipales(id:number){

  this.loadingInvolucradosPrincipales = true;
  this.notificacionServices.getInvolucradosPrincipales(id).subscribe({
    next: (data) => {
      this.involucradosPrincipales = data;
      this.loadingInvolucradosPrincipales = false;
      console.log('aquiiiiiii'+this.involucradosPrincipales);
    },
    error: (error) => {
      this.loadingInvolucradosPrincipales = false;
      console.error('Error al cargar involucrados principales:', error);
    }
  });

  }
  loadOtrosInvolucrados(id:number){

  this.loadingOtrosInvolucrados = true;
  this.notificacionServices.getOtrosPrincipales(id).subscribe({
    next: (data) => {
      this.otrosInvolucrados = data;
      this.loadingOtrosInvolucrados = false;
      console.log('aquiiiiiii'+this.otrosInvolucrados);
    },
    error: (error) => {
      this.loadingOtrosInvolucrados = false;
      console.error('Error al cargar otros involucrados:', error);
    }
  });
  }

//------------submit-----//

volver(): void {
    this.router.navigate(['/nna/fases/' + this.denunciaId]);
  }

  editarnotificados(): void{
    if (!this.itemEnEdicion) return;

    const formData = this.tipoNotificado === 'Representante Institucional'
      ? this.nuevaInstitucionForm.value
      : this.nuevoNotificadoForm.value;

    this.notificacionServices.putOtroNotificado(this.itemEnEdicion.idUsuario, formData).subscribe({
      next: (response) => {
        console.log('Notificado actualizado exitosamente:', response);
        toast.success('Notificado actualizado correctamente');

        // Recargar listas y resetear modo edición
        this.loadInvolucradosPrincipales(this.denunciaId);
        this.loadOtrosInvolucrados(this.denunciaId);
        this.cancelarEdicionNotificado();
      },
      error: (error) => {
        console.error('Error al actualizar notificado:', error);
        toast.error('Error al actualizar el notificado');
      }
    });
  }
  agregarNotificado(): void{
    if (this.tipoNotificado === 'persona') {
      const body = {
      ...this.nuevoNotificadoForm.value,

    };
    console.log(body);
    this.notificacionServices.postCrearnotificado(body).subscribe(() => {
      this.loadOtrosInvolucrados(this.denunciaId);
      this.nuevoNotificadoForm.reset();
      this.nuevoNotificadoForm.get('idDenuncia')?.setValue(this.denunciaId);

    });

    }else{
      const body = {
      ...this.nuevaInstitucionForm.value,

    };
    console.log(body);
    this.notificacionServices.postCrearnotificado(body).subscribe(() => {
      this.loadOtrosInvolucrados(this.denunciaId);
      this.nuevaInstitucionForm.reset();
      this.nuevaInstitucionForm.get('idDenuncia')?.setValue(this.denunciaId);

    });

    }

  }
  cancelarEdicionNotificado(): void{
    this.modoEdicionNotificados = false;
    this.itemEnEdicion = null;
    this.tipoNotificado = '';

    // Resetear ambos formularios
    this.nuevoNotificadoForm.reset();
    this.nuevaInstitucionForm.reset();

    // Restaurar valores por defecto
    this.nuevoNotificadoForm.get('idDenuncia')?.setValue(this.denunciaId);
    this.nuevoNotificadoForm.get('tipoParticipante')?.setValue('Otros');

    this.nuevaInstitucionForm.get('idDenuncia')?.setValue(this.denunciaId);
    this.nuevaInstitucionForm.get('tipoParticipante')?.setValue('Representante Institucional');

    console.log('Edición cancelada');
  }

  onSubmit(): void {
    switch (this.modoEdicionNotificados) {
      case true:
        this.editarnotificados();

        break;

      case false:
        this.agregarNotificado();

        break;
    }




  }

}
export default CrearNotificacionesComponent
