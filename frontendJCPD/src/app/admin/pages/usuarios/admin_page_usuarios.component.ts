import { Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';

import { UserService, Usuario } from '@admin/services/user.service';

import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import InputsComponent from '@shared/components/inputs/inputs.component';
import { ButtonSubmitComponent } from '@shared/components/button-submit/button-submit.component';
import { ModalComponent, ModalConfig } from '@shared/components/modal/modal.component';
import { AuthService } from '@auth/services/auth.service';


@Component({
  selector: 'app-admin_page_usuarios',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TablaEditComponent, CardFormComponent, InputsComponent, ButtonSubmitComponent, ModalComponent],
  templateUrl: './admin_page_usuarios.component.html',

})
export class Admin_page_usuariosComponent implements OnInit  {
  @ViewChild(ModalComponent) modalComponent!: ModalComponent;

  usuarios: Usuario[] = [];
  cantones: any[] = [];
  userForm!: FormGroup;
  modoEdicion = false;
  usuarioEnEdicion: Usuario | null = null;

  // Modal de validación
  mostrarModalValidacion = false;
  passwordValidacion = '';
  errorModal = '';
  modalConfig: ModalConfig = {
    titulo: ' Validación de Administrador',
    descripcion: 'Por motivos de seguridad, debe validar su identidad antes de editar usuarios del sistema',

  };

  constructor(private userService: UserService,
     private fb: FormBuilder,
     private authService: AuthService

  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.formulariousuario();
    this.cargarCantones();
  }

  cargarUsuarios() {
    this.userService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        console.log(this.usuarios);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        toast.error('Error al cargar la lista de usuarios');
      }
    });
  }

  formulariousuario(){
    this.userForm = this.fb.group({
      usuario: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['',Validators.required],
      contrasena: ['', Validators.required],
      rol: ['principal', Validators.required],
      id_canton: ['', Validators.required],
      isactivo: [true]
    });
  }

  cargarCantones() {
    this.userService.obtenerCantones().subscribe({
      next: (data) => {
        this.cantones = data;
      },
      error: (error) => {
        console.error('Error al cargar cantones:', error);
        toast.error('Error al cargar la lista de cantones');
      }
    });
  }

  editar(usuario: Usuario) {

    // Guardar el usuario que se va a editar
    this.usuarioEnEdicion = usuario;
    // Mostrar modal de validación de contraseña
    this.mostrarModalValidacion = true;

    this.passwordValidacion = '';
  }

  validarPasswordAdmin(password: string) {
    // Limpiar error anterior
    this.errorModal = '';

    if (!password) {
      this.errorModal = 'Debe ingresar la contraseña';
      return;
    }

    // Validar contraseña con el backend
    this.authService.validarPasswordAdmin(password).subscribe({
      next: (esValida) => {

        if (esValida) {
          toast.success('Contraseña validada correctamente');
          // Cerrar el modal programáticamente solo si la validación es exitosa
          if (this.modalComponent) {
            this.modalComponent.cerrarModal();
          }
          this.mostrarModalValidacion = false;
          this.procederConEdicion();
        } else {
          this.errorModal = 'Contraseña incorrecta. Inténtelo nuevamente.';
          this.passwordValidacion = '';
        }
      },
      error: (error) => {
        console.error('Error al validar contraseña:', error);
        this.errorModal = 'Error de conexión. Verifique su red e inténtelo de nuevo.';
        this.passwordValidacion = '';
      }
    });
  }

  procederConEdicion() {
    console.log('Procediendo con la edición del usuario después de validación',this.usuarioEnEdicion);
    if (!this.usuarioEnEdicion) return;


    this.modoEdicion = true;
    this.userForm.patchValue({
      usuario: this.usuarioEnEdicion.usuario,
      nombres: this.usuarioEnEdicion.nombres,
      apellidos: this.usuarioEnEdicion.apellidos,
      correo: this.usuarioEnEdicion.correo,
      contrasena: '', // No mostramos la contraseña por seguridad
      rol: this.usuarioEnEdicion.rol,
      id_canton: this.usuarioEnEdicion.id_canton,
      isactivo: this.usuarioEnEdicion.isactivo
    });
    // Hacer que la contraseña no sea requerida en modo edición
    this.userForm.get('contrasena')?.clearValidators();
    this.userForm.get('contrasena')?.updateValueAndValidity();
    
  }

  cerrarModalValidacion() {
    this.mostrarModalValidacion = false;
    this.passwordValidacion = '';
    this.errorModal = '';
    this.usuarioEnEdicion = null;
  }
  crearUsuario() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }
    if (this.userForm.valid) {
      this.userService.crearUsuario(this.userForm.value).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.userForm.reset();
          this.formulariousuario(); // Reinicializar valores por defecto
          toast.success('¡Usuario creado exitosamente!');
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          toast.error('Error al crear el usuario. Inténtelo nuevamente.');
        }
      });
    }
  }

  cambiarEstado(usuario: Usuario) {
    const nuevoEstado = !usuario.isactivo;
    const mensaje = nuevoEstado ? 'activado' : 'desactivado';

    this.userService.actualizarUsuario(usuario.id, { isactivo: nuevoEstado }).subscribe({
      next: () => {
        usuario.isactivo = nuevoEstado;
        toast.success(`Usuario ${mensaje} correctamente`);
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        toast.error('Error al cambiar el estado del usuario');
      }
    });
  }

  actualizarUsuario() {
    if (this.userForm.invalid || !this.usuarioEnEdicion) {
      this.userForm.markAllAsTouched();
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    const datosActualizacion = {...this.userForm.value};
    // Si no se ingresó nueva contraseña, no la incluimos en la actualización
    if (!datosActualizacion.contrasena) {
      delete datosActualizacion.contrasena;
    }

    this.userService.actualizarUsuario(this.usuarioEnEdicion.id, datosActualizacion).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.cancelarEdicion();
        toast.success('¡Usuario actualizado exitosamente!');
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        toast.error('Error al actualizar el usuario. Inténtelo nuevamente.');
      }
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.usuarioEnEdicion = null;
    this.userForm.reset();
    this.formulariousuario(); // Restaurar validaciones originales
  }

  eliminar(usuario: Usuario) {
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${usuario.nombres} ${usuario.apellidos}?`)) {
      this.userService.eliminarUsuario(usuario.id).subscribe({
        next: () => {
          this.cargarUsuarios();
          toast.success('Usuario eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          toast.error('Error al eliminar el usuario');
        }
      });
    }
  }


}
export default Admin_page_usuariosComponent;

