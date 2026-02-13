import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CardFormComponent } from "@shared/components/card-Form/card-Form.component";
import { AuthService } from '@auth/services/auth.service';

import { toast } from 'ngx-sonner';
import InputsComponent from '@shared/components/inputs/inputs.component';
import { ButtonSubmitComponent } from '@shared/components/button-submit/button-submit.component';
import { UserService } from '@admin/services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  imports: [CardFormComponent, CommonModule, ReactiveFormsModule, InputsComponent, ButtonSubmitComponent,RouterLink],
})
export class PerfilComponent implements OnInit {
    editPersonalInfoMode = false;
    personalInfoForm!: FormGroup;
  usuarioData: any | null = null;
  cargando = true;

  // Formulario de cambio de contraseña
  passwordForm!: FormGroup;
  cambiandoPassword = false;

  constructor(private AuthService: AuthService, private fb: FormBuilder,private userService: UserService) {
    this.initPasswordForm();
  }

  ngOnInit() {
    this.loadUsuarioData();
    this.initPersonalInfoForm();

  }
  initPersonalInfoForm() {
      this.personalInfoForm = this.fb.group({
        nombres: ['', Validators.required],
        apellidos: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        usuario: ['', Validators.required]
      });
    }

    startEditPersonalInfo() {
      if (!this.usuarioData) return;
      this.editPersonalInfoMode = true;
      this.personalInfoForm.patchValue({
        nombres: this.usuarioData.nombres,
        apellidos: this.usuarioData.apellidos,
        correo: this.usuarioData.correo,
        usuario: this.usuarioData.usuario
      });
    }

    cancelEditPersonalInfo() {
      this.editPersonalInfoMode = false;
      this.personalInfoForm.reset();
    }

    savePersonalInfo() {
      if (this.personalInfoForm.invalid) {
        this.personalInfoForm.markAllAsTouched();
        toast.error('Por favor, complete correctamente todos los campos');
        return;
      }
      // Aquí deberías llamar a tu servicio para actualizar la info personal
      // Ejemplo:
      // this.AuthService.actualizarPerfil(this.personalInfoForm.value).subscribe(...)
      // Simulación:
       const datosActualizacion = {...this.personalInfoForm.value};

      this.userService.actualizarUsuario(this.usuarioData.id, datosActualizacion).subscribe({
      next: () => {

        toast.success('¡Datos actualizados exitosamente!');
        this.loadUsuarioData();
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        toast.error('Error al actualizar el usuario. Inténtelo nuevamente.');
      }
    });

      this.editPersonalInfoMode = false;
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
        console.log('Datos del usuario cargados', user);
        this.usuarioData = user;
        this.cargando = false;

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
