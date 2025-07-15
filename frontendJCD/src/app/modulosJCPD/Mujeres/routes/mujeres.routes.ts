import { Routes } from '@angular/router';

export const mujeresRoutes: Routes = [
  {
    path: '',

    loadComponent: () => import('@mujeres/layout/mujeres-layout.component'),
    children: [
      {
        path: '',

        loadComponent: () => import('@mujeres/pages/mujeres/mujeres-pages-mujeres.component'),
      },

    ],
  },
];
export default mujeresRoutes;
