
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'admin_page_crearEditarUser',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin_page_crearEditarUser.component.html',

})
export class Admin_page_crearEditarUserComponent implements OnInit {

  form: FormGroup;
  cantones: any[] = [];
  esEdicion = false;
  usuarioId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      user:'',
      nombres: '',
      apellidos: '',
      correo: '',
      contrasena: '',
      rol: '',
      canton_id: '',
      estado: true
    });
  }

  ngOnInit(): void {
    this.usuarioId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = !!this.usuarioId;

    this.cargarCantones();
    if (this.esEdicion) this.cargarUsuario();
  }

  cargarCantones(): void {
    this.http.get<any[]>('http://localhost:3000/cantones').subscribe(
      data => this.cantones = data,
      error => console.error('Error al cargar cantones:', error)
    );
  }

  cargarUsuario(): void {
    this.http.get<any>(`http://localhost:3000/usuarios/${this.usuarioId}`).subscribe(
      data => {
        this.form.patchValue(data);
        this.form.get('contrasena')?.disable();
      },
      error => console.error('Error al cargar usuario:', error)
    );
  }

  guardarUsuario(): void {
    const datos = this.form.getRawValue();

    if (this.esEdicion) {
      this.http.put(`http://localhost:3000/usuarios/${this.usuarioId}`, datos).subscribe(
        () => this.router.navigate(['admin/usuarios']),
        error => console.error('Error al actualizar usuario:', error)
      );
    } else {
      this.http.post('http://localhost:3000/usuarios', datos).subscribe(
        () => this.router.navigate(['admin/usuarios']),
        error => console.error('Error al crear usuario:', error)
      );
    }
  }

}
export default Admin_page_crearEditarUserComponent;
