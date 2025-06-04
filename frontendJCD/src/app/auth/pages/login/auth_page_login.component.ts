import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth/services/auth.service';


@Component({
  selector: 'auth-page-login',
  templateUrl: './auth_page_login.component.html',
  imports:[CommonModule, ReactiveFormsModule, RouterModule]

})
export class AuthPageLoginComponent{
   form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      correo: '',
      contrasena: ''
    });
  }

  iniciarSesion(): void {
    const datos = this.form.value;

    this.http.post<any>('http://localhost:3000/auth/login', datos).subscribe(
      usuario => {
        localStorage.setItem('usuario', JSON.stringify(usuario)); // o authService.setUsuario() si lo agregas
        if (this.authService.esAdmin()) {
          this.router.navigate(['/admin/usuarios']);
        } else {
          this.router.navigate(['']);
        }
      },
      error => {
        console.error('Error al iniciar sesión:', error);
        alert('Credenciales incorrectas');
      }
    );
  }



}
export default AuthPageLoginComponent;
