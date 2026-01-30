import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CardFormComponent } from "@shared/components/card-Form/card-Form.component";
import { AuthService } from '@auth/services/auth.service';
import { perfil } from '@shared/interfaces/perfil.interface';
import { toast } from 'ngx-sonner';
import InputsComponent from '@shared/components/inputs/inputs.component';
import { ButtonSubmitComponent } from '@shared/components/button-submit/button-submit.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  imports: [CardFormComponent, CommonModule, ReactiveFormsModule, InputsComponent, ButtonSubmitComponent],
})
export class PerfilComponent implements OnInit {
  usuarioData: any | null = null;
  cargando = true;

  // Formulario de cambio de contraseña
  passwordForm!: FormGroup;
  cambiandoPassword = false;

  constructor(private AuthService: AuthService, private fb: FormBuilder) {
    this.initPasswordForm();
  }

  ngOnInit() {
    this.loadUsuarioData();
  }

  initPasswordForm() {
    this.passwordForm = this.fb.group({
      passwordActual: new FormControl('', [Validators.required]),
      nuevaPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmarPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const nueva = form.get('nuevaPassword');
    const confirmar = form.get('confirmarPassword');

    if (nueva && confirmar && nueva.value !== confirmar.value) {
      confirmar.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  loadUsuarioData(){
    this.cargando = true;
    this.AuthService.getUsuarioActual().subscribe({
      next: (user) => {
        this.usuarioData = user;
        this.cargando = false;
        console.log('Datos del usuario:', user);
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        toast.error('Error al cargar la información del perfil');
        this.cargando = false;
      }
    });
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      toast.error('Por favor, complete correctamente todos los campos');
      return;
    }

    this.cambiandoPassword = true;
    const passwordActual = this.passwordForm.get('passwordActual')?.value;
    const nuevaPassword = this.passwordForm.get('nuevaPassword')?.value;

    // Usar el servicio actualizarContrasenia
    this.AuthService.actualizarContrasenia(passwordActual, nuevaPassword).subscribe({
      next: (response) => {
        console.log('Respuesta del cambio de contraseña:', response);
        toast.success('Contraseña cambiada exitosamente');
        this.passwordForm.reset();
        this.cambiandoPassword = false;
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);

        // Manejar diferentes tipos de errores
        if (error.status === 400) {
          toast.error('La contraseña actual es incorrecta');
          this.passwordForm.get('passwordActual')?.setErrors({ 'incorrect': true });
        } else if (error.status === 401) {
          toast.error('No autorizado para cambiar la contraseña');
        } else {
          toast.error('Error al cambiar la contraseña. Inténtelo de nuevo');
        }

        this.cambiandoPassword = false;
      }
    });
  }
}
export default PerfilComponent;
