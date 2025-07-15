

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators,ReactiveFormsModule  } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload, login } from '@auth/interfaces/login.interface';



@Component({
  standalone: true,
  selector: 'auth-page-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth-page-login.component.html',


})
export class AuthPageLoginComponent implements OnInit {
   loginform: FormGroup;
   passwordVisible = false;
   loading = false;
   error='';


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginform = this.fb.group({
      usuario:['',[Validators.required,]],
      contrasena:['', [Validators.required,]],
      recordar: [false]
    });
  }

  ngOnInit(): void {
    // Cargar el usuario guardado en localStorage si existe
       const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    this.loginform.patchValue({ usuario: usuarioGuardado, recordar: true });
  }
  }

   get loginForm(): FormGroup {
  return this.loginform;
}


togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;


  }



  login(): void {

    console.log('Intentando iniciar sesión');



  this.loading = true;



    // Construir el objeto final
    const {recordar, ...body}:login =this.loginform.value
    if (this.loginform.value.recordar){
      localStorage.setItem('usuario', this.loginform.value.usuario);
    }else{
      localStorage.removeItem('usuario');
    }


   this.authService.login(body).subscribe({
  next: (token) => {

    localStorage.setItem('token', token);

    // Decodificar el token para obtener el rol
    const decoded = jwtDecode<JwtPayload>(token);
    console.log('Token decodificado:', decoded);

    // Redirigir según el rol
    if (decoded.rol === 'admin') {
      this.router.navigate(['/admin/usuarios']);
    } else {
      this.router.navigate(['/']);
    }
  },
  error: err => {

    this.loading = false;
    this.error = 'usuario o contraseña incorrectos';

    console.error('Error al iniciar :', err);
  }
});
  }
}


export default AuthPageLoginComponent;
