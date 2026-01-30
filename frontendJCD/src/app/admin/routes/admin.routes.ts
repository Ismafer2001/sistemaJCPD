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
    ],

  },
];

export default AdminRoutes;
