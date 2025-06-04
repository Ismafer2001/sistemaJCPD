import { Routes, RouterModule } from '@angular/router';

const AdminRoutes: Routes = [
  {
    path:'',

    loadComponent: () => import('@admin/layout/admin_layout.component'),
    children: [
      {
        path: 'usuarios',
        loadComponent: () => import ('@admin/pages/usuarios/admin_page_usuarios.component'),

      },
      {
          path: 'usuarios/formulario',
          loadComponent: () => import ('@admin/pages/crearEditar/admin_page_crearEditarUser.component'),

      },
      {
          path: 'usuarios/formulario/:id',
          loadComponent: () => import ('@admin/pages/crearEditar/admin_page_crearEditarUser.component'),

      },
    ],

  },
];

export default AdminRoutes;
