import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class NoAdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);

      // Si es admin, NO debe acceder a estas rutas
      if (decoded.rol === 'admin') {
        console.log('👨‍💼 Admin intentando acceder a ruta de grupos - Redirigiendo a /admin');
        this.router.navigate(['/admin/usuarios']);
        return false;
      }

      // Si no es admin, puede acceder normalmente
      return true;
    } catch (err) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
