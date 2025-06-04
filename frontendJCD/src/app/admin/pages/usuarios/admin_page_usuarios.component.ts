import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin_page_usuarios',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin_page_usuarios.component.html',

})
export class Admin_page_usuariosComponent implements OnInit {

  usuarios: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.http.get<any[]>('http://localhost:3000/usuarios').subscribe(
      data => {
        console.log('Usuarios recibidos:', data);
        this.usuarios = data;
      },
      error => console.error('Error al cargar usuarios:', error)
    );
  }

  editarUsuario(usuario: any): void {
    this.router.navigate(['admin/usuarios/formulario', usuario.id]);
  }

  cambiarEstado(usuario: any): void {
    const nuevoEstado = !usuario.estado;
    this.http.patch(`http://localhost:3000/usuarios/${usuario.id}/estado`, { estado: nuevoEstado }).subscribe(
      () => {
        usuario.estado = nuevoEstado;
        console.log('Estado actualizado');
      },
      error => console.error('Error al cambiar estado:', error)
    );
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.http.delete(`http://localhost:3000/usuarios/${id}`).subscribe(
        () => {
          this.usuarios = this.usuarios.filter(u => u.id !== id);
          console.log('Usuario eliminado');
        },
        error => console.error('Error al eliminar usuario:', error)
      );
    }
  }
  irACrear(): void {
  this.router.navigate(['admin/usuarios/formulario']);
}
}
export default Admin_page_usuariosComponent;
