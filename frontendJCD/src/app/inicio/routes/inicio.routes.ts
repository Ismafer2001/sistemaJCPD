import { Routes } from '@angular/router';

export const inicioRoutes: Routes = [
    {
        path: '',
        
        loadComponent: () => import('@inicio/layout/layout.component'),
        children: [
          {
            path: '',
            
            loadComponent: () =>
              import('@inicio/page/inicio_page_home.component'),
          },
        ],
      },
      
      

];
export default inicioRoutes;