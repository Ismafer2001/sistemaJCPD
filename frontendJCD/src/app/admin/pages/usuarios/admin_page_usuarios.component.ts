import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserService, Usuario } from '@admin/services/user.service';

import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';


@Component({
  selector: 'app-admin_page_usuarios',
  imports: [CommonModule, RouterModule, FormsModule, TablaEditComponent],
  templateUrl: './admin_page_usuarios.component.html',

})
export class Admin_page_usuariosComponent implements OnInit  {
  usuarios: Usuario[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.userService.obtenerUsuarios().subscribe(data =>{

      this.usuarios = data
      console.log(this.usuarios)
    });
  }

  editar(usuario: Usuario) {
    console.log('Editar', usuario);
    // Aquí puedes abrir un modal o navegar a un formulario de edición
  }

  cambiarEstado(usuario: Usuario) {
    const nuevoEstado = !usuario.isactivo;
    this.userService.actualizarUsuario(usuario.id, { isactivo: nuevoEstado }).subscribe(() => {
      usuario.isactivo = nuevoEstado;
    });
  }

  eliminar(usuario:Usuario) {
    this.userService.eliminarUsuario(usuario.id).subscribe(() => this.cargarUsuarios());
  }


}
export default Admin_page_usuariosComponent;

