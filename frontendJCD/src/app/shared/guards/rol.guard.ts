
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { Router } from '@angular/router';

export const rolGuard = (rolRequerido: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const usuario = authService.getUsuario();

   

    return true;
  };
};
