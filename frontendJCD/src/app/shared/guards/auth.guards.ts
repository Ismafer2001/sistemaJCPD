/**import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  try {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario) {
      router.navigate(['/auth/login']);
      return false;
    }

    return true;
  } catch {
    router.navigate(['/auth/login']);
    return false;
  }
};**/

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
