# Componente Modal Simplificado

Un componente modal reutilizable y fácil de usar con configuración mínima.

## Uso

### En tu componente TypeScript

```typescript
import { ModalComponent, ModalConfig } from '@shared/components/modal/modal.component';

@Component({
  imports: [ModalComponent, ...]
})
export class MiComponente {
  modalVisible = false;
  inputModal = '';

  // Configuración simple del modal
  modalConfig: ModalConfig = {
    titulo: 'Confirmar Eliminación',
    descripcion: '¿Está seguro de que desea eliminar este usuario?',
    inputLabel: 'Motivo',
    inputPlaceholder: 'Ingrese el motivo...',
    confirmText: 'Eliminar',
    confirmColor: 'error'
  };

  abrirModal() {
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
  }

  confirmarAccion(valor: string) {
    console.log('Valor ingresado:', valor);
    // Realizar acción con el valor
    this.cerrarModal();
  }

  cancelarAccion() {
    console.log('Acción cancelada');
    this.cerrarModal();
  }
}
```

### En tu template HTML

```html
<!-- Uso simplificado -->
<app-modal
  [isVisible]="modalVisible"
  [config]="modalConfig"
  [(inputValue)]="inputModal"
  (confirmado)="confirmarAccion($event)"
  (cancelado)="cancelarAccion()"
  (modalCerrado)="cerrarModal()"
></app-modal>

<!-- Botón para abrir -->
<button (click)="abrirModal()">Eliminar Usuario</button>
```

## Configuración (ModalConfig)

Solo necesitas pasar un objeto de configuración:

```typescript
interface ModalConfig {
  titulo: string;                    // Requerido
  descripcion?: string;              // Opcional
  inputLabel?: string;               // Por defecto: 'Input'
  inputPlaceholder?: string;         // Opcional
  inputType?: 'text' | 'email' | 'password' | 'number'; // Por defecto: 'text'
  confirmText?: string;              // Por defecto: 'Confirmar'
  cancelText?: string;               // Por defecto: 'Cancelar'
  confirmColor?: 'submit' | 'afirmar' | 'cancelar' | 'accion' | 'error'; // Por defecto: 'submit'
}
```

## Ejemplos de Uso

### Modal de Confirmación Simple
```typescript
modalConfig = {
  titulo: 'Confirmar acción',
  descripcion: '¿Está seguro?'
};
```

### Modal para Agregar Elemento
```typescript
modalConfig = {
  titulo: 'Nuevo Usuario',
  inputLabel: 'Nombre',
  inputPlaceholder: 'Ingrese el nombre...',
  confirmText: 'Crear',
  confirmColor: 'submit'
};
```

### Modal de Eliminación
```typescript
modalConfig = {
  titulo: 'Eliminar Usuario',
  descripcion: 'Esta acción no se puede deshacer',
  inputLabel: 'Confirme escribiendo el nombre',
  confirmText: 'Eliminar',
  confirmColor: 'error'
};
```

## Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `isVisible` | boolean | Controla la visibilidad |
| `config` | ModalConfig | Configuración completa |
| `inputValue` | string | Valor del input (two-way binding) |

## Eventos

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `confirmado` | string | Valor del input al confirmar |
| `cancelado` | void | Se emite al cancelar |
| `modalCerrado` | void | Se emite al cerrar el modal |

## Beneficios de la Simplificación

- **Menos código**: Solo 3 propiedades en lugar de 12+
- **Más legible**: Configuración agrupada en un objeto
- **Fácil mantenimiento**: Un solo lugar para configurar todo
- **Valores por defecto**: Funciona con configuración mínima
- **Tipado fuerte**: Interface TypeScript para la configuración