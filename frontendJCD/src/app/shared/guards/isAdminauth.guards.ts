import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.esAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

