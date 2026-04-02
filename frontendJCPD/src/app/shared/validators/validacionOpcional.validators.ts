import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Validador condicional que aplica Validators.required solo cuando la condición es verdadera
 * @param condition - Función que retorna boolean para determinar si aplicar validación
 * @returns ValidatorFn
 */
export function requiredWhen(condition: () => boolean): ValidatorFn {
  return (control: AbstractControl) => {
    if (!condition()) {
      return null; // No validar si la condición es falsa
    }

    // Aplicar validación required si la condición es verdadera
    if (!control.value || control.value.toString().trim() === '') {
      return { required: true };
    }

    return null;
  };
}
