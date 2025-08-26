import { Routes, RouterModule } from '@angular/router';

const Adultosroutes: Routes = [
  {
    path: '',

    loadComponent: () => import('@adultos/layout/adultosM-layout.component'),
    children: [
      {
        path: '',

        loadComponent: () => import('@adultos/pages/adultos/adultos.component'),
      },

    ],
  },
];

export default Adultosroutes
