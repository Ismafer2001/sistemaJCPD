// src/app/guards/grupo-valido.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
//valido si la ruta va ser dinamica y se usara parametros :grupo
//ejemplo thhp://nna,ejemplo thhp://mujeres, ejemplo thhp://adultos
export const grupoValidoGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  // Define los grupos válidos
  const gruposValidos = ['nna', 'adultos', 'mujeres'];

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
