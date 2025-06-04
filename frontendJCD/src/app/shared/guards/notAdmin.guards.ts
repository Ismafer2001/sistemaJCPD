import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
//restringe que administradores ingresen a denuncias
export const notadminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.esUsuario()) {
    return true;
  }

  router.navigate(['/admin/usuarios']);
  return false;
};
