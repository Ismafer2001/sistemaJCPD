import { Routes, RouterModule } from '@angular/router';
import AuthPageLoginComponent from '@auth/pages/login/auth_page_login.component';

const authroutes: Routes = [
  {
    path: '',
    
    loadComponent: () => import('@auth/layout/auth_layout.component'),
    children: [
      {
        path: 'login',
        
        
        loadComponent: () =>
          import('@auth/pages/login/auth_page_login.component'),
      },
    ],
  },
];

export default authroutes;

