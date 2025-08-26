
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate{

  constructor( private router: Router, private authService:AuthService){

  }
  canActivate(): boolean {
    const isAuth = this.authService.isAuthenticated();

    if (!isAuth) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }




};
