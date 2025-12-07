// src/app/guards/grupo-valido.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const grupoValidoGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  // Define los grupos válidos
  const gruposValidos = ['nna', 'adultos'];

  // Obtiene el parámetro 'grupo' de la ruta
  const grupo = route.paramMap.get('grupo');

  // Verifica si el grupo es válido
  if (grupo && gruposValidos.includes(grupo)) {
    return true;
  }

  // Si no es válido, redirige al inicio o a 404
  router.navigate(['/']); // o ['/404']
  return false;
};
