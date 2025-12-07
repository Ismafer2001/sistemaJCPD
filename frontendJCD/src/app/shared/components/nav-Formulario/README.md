# Componente Nav-Formulario

Un componente reutilizable de navegación con tabs y botones de acción para formularios.

## Uso

### Importar el componente

```typescript
import { NavFormularioComponent, TabConfig, ActionConfig } from './shared/components/nav-Formulario/nav-Formulario.component';
```

### En tu template HTML

```html
<app-nav-formulario
  [tabs]="tabsConfig"
  [actions]="actionsConfig"
  [currentTab]="currentTab"
  (tabChanged)="cambiarTab($event)"
  (actionClicked)="handleAction($event)"
></app-nav-formulario>
```

### En tu componente TypeScript

```typescript
export class MiComponente {
  currentTab = 0;

  // Configuración de tabs
  tabsConfig: TabConfig[] = [
    {
      id: 0,
      label: 'datos generales'
    },
    {
      id: 1,
      label: 'sobre los hechos',
      hasError: true,
      errorCondition: this.denunciaForm.get('descripcion_hechos')?.invalid && this.denunciaForm.get('descripcion_hechos')?.touched
    },
    {
      id: 2,
      label: 'pdf'
    }
  ];

  // Configuración de botones de acción
  actionsConfig: ActionConfig[] = [
    {
      id: 'update',
      icon: `<path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />`,
      tooltip: 'Actualizar denuncia',
      hoverClass: 'hover:bg-blue-700 hover:text-white'
    },
    {
      id: 'save',
      type: 'submit',
      icon: `<path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm5.845 17.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V12a.75.75 0 0 0-1.5 0v4.19l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z" clip-rule="evenodd" />
      <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />`,
      tooltip: 'Guardar denuncia',
      hoverClass: 'hover:bg-green-600 hover:text-white'
    },
    {
      id: 'pdf',
      icon: `<path fill-rule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 0 0 3 3h.27l-.155 1.705A1.875 1.875 0 0 0 7.232 22.5h9.536a1.875 1.875 0 0 0 1.867-2.045l-.155-1.705h.27a3 3 0 0 0 3-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0 0 18 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM16.5 6.205v-2.83A.375.375 0 0 0 16.125 3h-8.25a.375.375 0 0 0-.375.375v2.83a49.353 49.353 0 0 1 9 0Zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 0 1-.374.409H7.232a.375.375 0 0 1-.374-.409l.526-5.784a.373.373 0 0 1 .333-.337 41.741 41.741 0 0 1 8.566 0Zm.967-3.97a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H18a.75.75 0 0 1-.75-.75V10.5ZM15 9.75a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H15Z" clip-rule="evenodd" />`,
      tooltip: 'Generar PDF',
      hoverClass: 'hover:bg-green-600 hover:text-white'
    }
  ];

  cambiarTab(tabId: number) {
    this.currentTab = tabId;
  }

  handleAction(actionId: string) {
    switch (actionId) {
      case 'update':
        this.updateDenuncia(this.idDenuncia);
        break;
      case 'save':
        // El botón submit manejará automáticamente el formulario
        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
}
```

## Interfaces

### TabConfig
- `id: number` - Identificador único del tab
- `label: string` - Texto a mostrar en el tab
- `hasError?: boolean` - Si el tab puede mostrar errores
- `errorCondition?: boolean` - Condición para mostrar el estado de error

### ActionConfig
- `id: string` - Identificador único de la acción
- `type?: 'button' | 'submit'` - Tipo de botón (por defecto 'button')
- `icon: string` - SVG path del ícono
- `tooltip: string` - Texto del tooltip
- `hoverClass?: string` - Clases CSS para el hover
- `disabled?: boolean` - Si el botón está deshabilitado

## Eventos

- `tabChanged: EventEmitter<number>` - Se emite cuando cambia el tab activo
- `actionClicked: EventEmitter<string>` - Se emite cuando se hace clic en un botón de acción

## Características

- **Tabs dinámicos**: Configura cuantos tabs necesites
- **Estados de error**: Los tabs pueden mostrar estados de error con color rojo
- **Botones de acción**: Botones personalizables con iconos SVG
- **Responsive**: Diseño adaptable
- **Reutilizable**: Se puede usar en cualquier formulario
- **Tipado**: Interfaces TypeScript para mayor seguridad