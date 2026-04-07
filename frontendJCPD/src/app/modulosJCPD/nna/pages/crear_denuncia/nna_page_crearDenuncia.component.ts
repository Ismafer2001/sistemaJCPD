import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { DenunciaService } from '../../services/denuncia.service';
import { VulneracionService, Vulneracion } from '../../services/vulneracion.service';
import { MedidasService, ArticuloMedidas, Medida } from '../../services/medidas.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Nna_creardenuncia_denuncianteComponent } from './componentes/denunciante/nna_creardenuncia_denunciante.component';
import { Nna_creardenuncia_afectadoComponent } from './componentes/afectado/nna_creardenuncia_afectado.component';
import { Nna_creardenuncia_denunciadoComponent } from './componentes/denunciado/nna_creardenuncia_denunciado.component';
import { Nna_creardenuncia_vulneracionesComponent } from './componentes/vulneraciones/nna_creardenuncia_vulneraciones.component';
import { Crear_denuncia_medidasComponent } from './componentes/medidas/crear_denuncia_medidas.component';
import { AuthService } from '@auth/services/auth.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { validarCedulaEcuador } from '@shared/validators/cedula.validators';

import { toast } from 'ngx-sonner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavFormularioComponent } from '@shared/components/nav-Formulario/nav-Formulario.component';
import { requiredWhen } from '@shared/validators/validacionOpcional.validators';
//import { Generador_PDFService } from '../../../shared/services/pdf/generador_PDF.service';

@Component({
  selector: 'app-nna-page-crearDenuncia',
  templateUrl: './nna_page_crearDenuncia.component.html',

  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Nna_creardenuncia_denuncianteComponent,
    Nna_creardenuncia_afectadoComponent,
    Nna_creardenuncia_denunciadoComponent,
    Nna_creardenuncia_vulneracionesComponent,
    Crear_denuncia_medidasComponent,
    CardFormComponent,
    NavFormularioComponent,RouterLink
  ],
})
export class NnaPageCrearDenunciaComponent implements OnInit {
//--- Configuración de tabs------//
  tabsConfig: any[] = [
    {
      id: 0,
      label: 'datos generales'
    },
    {
      id: 1,
      label: 'sobre los hechos'
    },
    {
      id: 2,
      label: 'pdf'
    }
  ];
  currentTab = 0; //variable para cambiar pestañas del formulario
// Configuración de botones de acción
  actionsConfig: any[] = [
    {
      id: 'update',
      type: 'button',
      icon: `<path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />`,
      tooltip: 'Actualizar denuncia',
      hoverClass: 'hover:bg-blue-700 hover:text-white',
      disabled: true
    },
    {
      id: 'save',
      type: 'button',
      icon: `<path fill-rule="evenodd" d="M3.75 3.375c0-1.036.84-1.875 1.875-1.875h11.47c.497 0 .974.197 1.326.548l2.905 2.905c.351.352.549.829.549 1.326V20.25c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375Zm14.625-.375v4.5c0 .621-.504 1.125-1.125 1.125h-10.5A1.125 1.125 0 0 1 5.625 7.5V3h12.75Zm-12.75 9.75c0-.621.504-1.125 1.125-1.125h10.5c.621 0 1.125.504 1.125 1.125v5.625c0 .621-.504 1.125-1.125 1.125H6.75a1.125 1.125 0 0 1-1.125-1.125v-5.625Z" clip-rule="evenodd"/>
<path d="M15.75 3h1.5v3.75h-1.5V3Z" fill="currentColor"/>
<path d="M8.25 15h7.5v1.5h-7.5V15Zm0 2.25h7.5v1.5h-7.5v-1.5Z" fill="currentColor"/>`,
      tooltip: 'Guardar denuncia',
      hoverClass: 'hover:bg-green-600 hover:text-white',
      disabled: false
    },
    {
      id: 'pdf',
      type: 'button',
      icon: `<path d="M14.25 1.5v4.875c0 .621.504 1.125 1.125 1.125h4.875M9 1.5H5.625c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V7.5L14.25 1.5H9Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
<rect x="6" y="9" width="12" height="5" rx="0.5" fill="currentColor"/>
<path d="M7.5 10.5h1.2c.5 0 .8.3.8.8s-.3.8-.8.8h-.7v1h-.5v-2.6Zm.5.5v.8h.7c.2 0 .3-.1.3-.4s-.1-.4-.3-.4h-.7ZM10.5 10.5h1c.8 0 1.3.5 1.3 1.3s-.5 1.3-1.3 1.3h-1v-2.6Zm.5.5v1.6h.5c.4 0 .8-.2.8-.8s-.4-.8-.8-.8h-.5ZM14 10.5h2v.5h-1.5v.5h1.2v.5h-1.2v1h-.5v-2.5Z" fill="white"/>
<path d="M12 16v5m0 0l-2.5-2.5M12 21l2.5-2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      tooltip: 'Generar PDF',
      hoverClass: 'hover:bg-green-600 hover:text-white',
      disabled: true
    }
  ];

  existeAvocatoria: any = null;
  numTramiteDisabled = true;
  incrementar = false;


  denunciaedit:any =null;
  editMode: boolean = false;

  loading = false;
  initialLoading = true; // Para la carga inicial de datos
  pdfLoading = false; // Para la carga del PDF
  error: string | null = null;
  pdfError: string | null = null;
  // Variable para el cantón
  anioActual!: number;
  canton!: string;
  pdfSrc: SafeResourceUrl | null = null;
  idDenuncia!: number;
  grupo: string = "nna";
  isEditDenunciaActivate:boolean=false;

  // Variables para controlar campos condicionales
  mostrarCamposMujeres = false;

  // Opciones para campos de mujeres
  tiposViolencia = [
    { id: 'fisica', label: 'Física' },
    { id: 'psicologica', label: 'Psicológica' },
    { id: 'sexual', label: 'Sexual' },
    { id: 'economica', label: 'Económica y Patrimonial' },
    { id: 'simbolica', label: 'Simbólica' },
    { id: 'politica', label: 'Política' },
    { id: 'gineco_obstetrica', label: 'Gineco-obstétrica' }
  ];

  ambitosViolencia = [
    { id: 'intrafamiliar', label: 'Intrafamiliar o Doméstico' },
    { id: 'educativo', label: 'Educativo' },
    { id: 'laboral', label: 'Laboral' },
    { id: 'salud', label: 'De Salud' },
    { id: 'institucional', label: 'Institucional' },
    { id: 'politico', label: 'Político' },
    { id: 'deportivo', label: 'Deportivo' },
    { id: 'publico', label: 'Público o Callejero' }
  ];

  denunciaForm!: FormGroup;
  vulneracionesCatalogo: Vulneracion[] = [];
  todasLasMedidas: Medida[] = [];
  tipoDenunciaSeleccionado: string = '';

  constructor(
    private AuthService: AuthService,
    private fb: FormBuilder,
    private denunciaService: DenunciaService,
    private vulneracionService: VulneracionService,
    private medidasService: MedidasService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initialLoading = true;

    // Cargar catálogo de vulneraciones para mapear nombres a IDs
    this.vulneracionService.getVulneraciones().subscribe({
      next: (data) => {
        this.vulneracionesCatalogo = data;
        this.checkInitialLoadingComplete();
      },
      error: (error) => {
        console.error('Error al cargar vulneraciones:', error);
        this.checkInitialLoadingComplete();
      }
    });

    // Cargar catálogo de medidas para mapear nombres a IDs
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
        if (response && response.success) {
          this.todasLasMedidas = response.data || [];
        } else if (Array.isArray(response)) {
          this.todasLasMedidas = response as Medida[];
        }
        this.checkInitialLoadingComplete();
      },
      error: (err) => {
        console.error('Error al cargar medidas:', err);
        this.checkInitialLoadingComplete();
      }
    });


    // Crear el formulario primero
    this.denunciaFormulario();

    // Luego configurar campos condicionales
    this.configurarCamposCondicionales();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.idDenuncia = +params['id'];


      }

    })

    this.route.params.subscribe(params => {

      if (params['modo']==='editar') {
        this.editMode = true;
        this.denunciaForm.disable();



        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
         this.actionsConfig[1].disabled = true
       this.actionsConfig[2].disabled = false // PDF habilitado
        this.actionsConfig[0].disabled = false; // Editar deshabilitado hasta que haya cambios

      }else{
        this.actionsConfig[1].disabled = false
        this.actionsConfig[2].disabled = true

      };

    });

    this.AuthService.getUsuarioActual().subscribe((user) => {
      this.denunciaForm.get('id_canton')?.setValue(user.id_canton);
      this.canton = user.canton;
    });

    if (!this.editMode) {
      this.denunciaService.obtenerNumTramite(this.grupo).subscribe((res) => {
        if (res.numero) {
          this.denunciaService.obtenerNumTramite(this.grupo, true).subscribe((res2) => {
            this.setearNumTramite(res2.numero);
          });
        } else {
          this.numTramiteDisabled = false;
          this.denunciaForm.get('num_tramite')?.enable();
        }
      });

    } else {
      // Cargar datos y luego suscribirse a valueChanges para evitar que se dispare al hacer patchValue
      this.cargarDatosEdicion(this.idDenuncia);

    }


      this.denunciaForm.get('tipo_denuncia')?.valueChanges.subscribe((value) => {
        this.tipoDenunciaSeleccionado = value;

         const denuncianteGroup = this.denunciaForm.get('denunciante') as FormGroup;
    Object.keys(denuncianteGroup.controls).forEach(key => {
      denuncianteGroup.get(key)?.updateValueAndValidity();
    });
      })


  }

  // Método para verificar si la carga inicial está completa
  private checkInitialLoadingComplete(): void {
    if (this.vulneracionesCatalogo.length > 0 && this.todasLasMedidas.length > 0) {
      this.initialLoading = false;
    }
  }

  //--------- CREACION FORMULARIO--------------------//
  denunciaFormulario() {
    this.anioActual = new Date().getFullYear();


    this.denunciaForm = this.fb.group({
      num_tramite: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.min(1),
        ],
      ],
      tipo_denuncia: ["", Validators.required],
      medio: ['', Validators.required

        ],

      anio: [this.anioActual],

      denunciante: this.fb.group({
        cedula: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio'),
          Validators.pattern('^[0-9]{10}$'),
          validarCedulaEcuador
        ]],
        nombres: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio'),
          Validators.minLength(2)
        ]],
        apellidos: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio'),
          Validators.minLength(2)
        ]],
        edad: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio'),
          Validators.min(0),
          Validators.max(120)
        ]],
        sexo: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio')
        ]],
        nacionalidad: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio')
        ]],
        direccion: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio'),
          Validators.minLength(5)
        ]],
        mail: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio'),
          Validators.email
        ]],
        telefono: ['', [
          requiredWhen(() => this.tipoDenunciaSeleccionado!== 'oficio'),
          Validators.pattern('^[0-9]{10}$')
        ]],
      }),
      afectados: this.fb.array([], [Validators.required]),
      denunciados: this.fb.array([], Validators.required),
      descripcion_hechos: ['', [Validators.required, Validators.minLength(10)]],
      solicitud: ['', [Validators.required, Validators.minLength(10)]],
      vulneraciones: this.fb.array([], [Validators.required]),
      medidas: this.fb.array([], [Validators.required]),

      // Campos específicos para mujeres (siempre presentes pero con validación condicional)
      tipoDeViolencia: [''], // Cambiar a string simple
      ambitoViolencia: [''],

      id_canton: [],
      grupoPrioritario: [this.grupo],
    });
  }

  //----------------GETTERS FORMULARIOS-----------------//

  get denuncianteForm(): FormGroup {
    return this.denunciaForm.get('denunciante') as FormGroup;
  }

  get afectadosArray(): FormArray {
    return this.denunciaForm.get('afectados') as FormArray;
  }

  get denunciadosArray(): FormArray {
    return this.denunciaForm.get('denunciados') as FormArray;
  }

  get vulneracionesForm(): FormArray {
    return this.denunciaForm.get('vulneraciones') as FormArray;
  }
  get medidasForm(): FormArray {
    return this.denunciaForm.get('medidas') as FormArray;
  }

  // Getter simplificado para tipos de violencia como string
  get tiposViolenciaValue(): string {
    return this.denunciaForm?.get('tipoDeViolencia')?.value || '';
  }

  //--------- CONFIGURACIÓN CAMPOS CONDICIONALES ---------//
  private configurarCamposCondicionales(): void {
    // Verificar que el formulario exista
    if (!this.denunciaForm) {
      console.warn('Formulario no existe aún, saltando configuración de campos condicionales');
      return;
    }

    this.mostrarCamposMujeres = this.grupo === 'mujeres';

    if (this.mostrarCamposMujeres) {
      this.aplicarValidacionesMujeres();
    } else {
      this.limpiarValidacionesMujeres();
    }
  }

  private aplicarValidacionesMujeres(): void {
    if (!this.denunciaForm) return;

    // Hacer requeridos los campos de violencia para mujeres
    const tiposControl = this.denunciaForm.get('tipoDeViolencia');
    const ambitoControl = this.denunciaForm.get('ambitoViolencia');

    // Validar que al menos un tipo de violencia esté seleccionado (string no vacío)
    tiposControl?.setValidators([Validators.required]);
    ambitoControl?.setValidators([Validators.required]);

    tiposControl?.updateValueAndValidity();
    ambitoControl?.updateValueAndValidity();
  }

  private limpiarValidacionesMujeres(): void {
    if (!this.denunciaForm) return;

    const tiposControl = this.denunciaForm.get('tipoDeViolencia');
    const ambitoControl = this.denunciaForm.get('ambitoViolencia');

    tiposControl?.clearValidators();
    ambitoControl?.clearValidators();

    // Limpiar valores
    tiposControl?.setValue('');
    ambitoControl?.setValue('');

    tiposControl?.updateValueAndValidity();
    ambitoControl?.updateValueAndValidity();
  }

  // Métodos simplificados para manejar checkboxes de tipos de violencia
  onTipoViolenciaChange(tipoId: string, event: any): void {
    const tiposControl = this.denunciaForm?.get('tipoDeViolencia');
    if (!tiposControl) return;

    const currentValue = tiposControl.value || '';
    const tiposArray = currentValue ? currentValue.split(', ').filter((t: string) => t.trim() !== '') : [];

    if (event.target.checked) {
      // Agregar el tipo si no existe
      if (!tiposArray.includes(tipoId)) {
        tiposArray.push(tipoId);
      }
    } else {
      // Remover el tipo
      const index = tiposArray.indexOf(tipoId);
      if (index !== -1) {
        tiposArray.splice(index, 1);
      }
    }

    // Actualizar el valor del control
    const newValue = tiposArray.join(', ');
    tiposControl.setValue(newValue);
    tiposControl.markAsTouched(); // Para que se disparen las validaciones
  }

  isTipoViolenciaSelected(tipoId: string): boolean {
    const currentValue = this.tiposViolenciaValue;
    if (!currentValue) return false;

    const tiposArray = currentValue.split(', ').filter((t: string) => t.trim() !== '');
    return tiposArray.includes(tipoId);
  }

  //CARGA DE DATOS EN MODO EDICION
  cargarDatosEdicion(id: number): void {


    this.denunciaService.obtenerDenunciaEditMode(id).subscribe(data => {
      this.denunciaedit = data.denuncia;

      this.existeAvocatoria=data.denuncia.avocatoria
      this.denunciaForm.patchValue(this.denunciaedit);

      if(this.existeAvocatoria){
        this.actionsConfig[0].disabled = true
        this.denunciaForm.disable();

        toast.warning('No puedes editar esta denuncia', {
          duration: 10000,
          description: 'Ya existe una avocatoria asociada a esta denuncia',
        });
      }
      // Patch solo al grupo denunciante si existe
      if (data.denunciantes) {
        (this.denunciaForm.get('denunciante') as FormGroup).patchValue(data.denunciantes[0]);
      }
       // Patch al FormArray denunciados si existe
      if (data.denunciados && Array.isArray(data.denunciados)) {
        const denunciadosArray = this.denunciaForm.get('denunciados') as FormArray;
        denunciadosArray.clear();
        data.denunciados.forEach((denunciado: any) => {
          denunciadosArray.push(this.fb.group({ ...denunciado }));
        });
      }
      // Patch al FormArray afectados si existe
      if (data.afectados && Array.isArray(data.afectados)) {
        const afectadosArray = this.denunciaForm.get('afectados') as FormArray;
        afectadosArray.clear();
        data.afectados.forEach((afectado: any) => {
          afectadosArray.push(this.fb.group({ ...afectado }));
        });
      }
      // Patch al FormArray vulneraciones si existe
      if (data.vulneraciones && Array.isArray(data.vulneraciones)) {
        const vulneracionesArray = this.denunciaForm.get('vulneraciones') as FormArray;
        vulneracionesArray.clear();
        // Si la data es [{ id_afectado, vulneraciones: [...] }, ...]
        data.vulneraciones.forEach((item: any) => {
          let ids: number[] = [];
          if (Array.isArray(item.vulneraciones)) {
            ids = item.vulneraciones.map((v: any) => {
              if (typeof v === 'string') {
                const found = this.vulneracionesCatalogo.find(cat => cat.vulneracion === v);
                return found ? found.id : null;
              } else if (typeof v === 'object' && v !== null) {
                if ('id' in v && typeof v.id === 'number') {
                  return v.id;
                } else if ('nombre' in v && typeof v.nombre === 'string') {
                  const found = this.vulneracionesCatalogo.find(cat => cat.vulneracion === v.nombre);
                  return found ? found.id : null;
                } else if ('vulneracion' in v && typeof v.vulneracion === 'string') {
                  const found = this.vulneracionesCatalogo.find(cat => cat.vulneracion === v.vulneracion);
                  return found ? found.id : null;
                }
              } else if (typeof v === 'number') {
                return v;
              }
              return null;
            }).filter((id: number | null): id is number => id !== null);
          }
          // Buscar el índice del afectado correspondiente
          let indexAfectado = -1;
          if (Array.isArray(data.afectados)) {
            // Buscar por id si existe, si no, por coincidencia de objeto
            if ('idAfectado' in item) {
              indexAfectado = data.afectados.findIndex((af: any) => af.id === item.idAfectado || af.idAfectado === item.idAfectado);
            } else if ('id' in item) {
              indexAfectado = data.afectados.findIndex((af: any) => af.id === item.id || af.idAfectado === item.id);
            }
            // Si no se encuentra, usar 0 por defecto
            if (indexAfectado === -1) indexAfectado = 0;
          } else {
            indexAfectado = 0;
          }
          // Validación defensiva: solo hacer push si el objeto es válido
          if (
            (typeof item === 'object' && item !== null) &&
            Array.isArray(ids)
          ) {
            vulneracionesArray.push(this.fb.group({
              idAfectado: [String(indexAfectado)],
              vulneraciones: [ids]
            }));
          } else {
            console.warn('Item vulneracion inválido, no se agrega al FormArray:', item);
          }
        });
      }
      // Patch al FormArray medidas si existe
      if (data.medidas && Array.isArray(data.medidas)) {
        const medidasArray = this.denunciaForm.get('medidas') as FormArray;
        medidasArray.clear();
        data.medidas.forEach((item: any) => {

          // ids_medidas puede venir como array de numbers, strings (descripciones) o objetos
          // Normalizamos para que el FormArray almacene IDs como strings
          let ids_medidas: string[] = [];
          const sourceArray = Array.isArray(item.ids_medidas) ? item.ids_medidas : (Array.isArray(item.medidas) ? item.medidas : (Array.isArray(item.medida) ? item.medida : []));
          if (Array.isArray(sourceArray)) {
            ids_medidas = sourceArray.map((m: any) => {
              // Si ya es un número, convertir a string
              if (typeof m === 'number') return String(m);
              // Si viene como string
              if (typeof m === 'string') {
                const trimmed = m.trim();
                if (trimmed === '') return null;
                // Si la string representa un número, devolverla tal cual (normalizada)
                const num = Number(trimmed);
                if (!isNaN(num)) return String(num);
                // Si no es número, intentar buscar en el catálogo de medidas por nombre (exacto o parcial)
                const found = this.todasLasMedidas.find((medida: Medida) => {
                  const a = String(medida.medida || '').toLowerCase().trim();
                  const b = trimmed.toLowerCase();
                  return a === b || a.includes(b) || b.includes(a);
                });
                if (found) return String(found.id);
                return null;
              }
              // Si viene como objeto con id
              if (typeof m === 'object' && m !== null) {
                if ('id' in m && typeof m.id === 'number') return String(m.id);
                if ('id' in m && typeof m.id === 'string') {
                  const parsed = Number(m.id);
                  return isNaN(parsed) ? null : String(parsed);
                }
              }
              return null;
            }).filter((id: string | null): id is string => id !== null && id !== '');
          }

          // Determinar índice del afectado (id_afectado) en el array afectados
          let indexAfectado = -1;
          if (Array.isArray(data.afectados)) {
            // Resolver por varios posibles campos: id_afectado, idAfectado, id
            if ('id_afectado' in item) {
              indexAfectado = data.afectados.findIndex((af: any) => af.id === item.id_afectado || af.id_afectado === item.id_afectado);
            } else if ('idAfectado' in item) {
              indexAfectado = data.afectados.findIndex((af: any) => af.id === item.idAfectado || af.idAfectado === item.idAfectado);
            } else if ('id' in item) {
              indexAfectado = data.afectados.findIndex((af: any) => af.id === item.id || af.id_afectado === item.id || af.idAfectado === item.id);
            }
            // Si backend trae el nombre del afectado (p.ej. 'nombres', 'nombre' o 'afectado'), intentar coincidir por nombre
            if (indexAfectado === -1) {
              const nameCandidates: string[] = [];
              if (typeof item.nombres === 'string') nameCandidates.push(item.nombres);
              if (typeof item.nombre === 'string') nameCandidates.push(item.nombre);
              if (typeof item.afectado === 'string') nameCandidates.push(item.afectado);
              if (typeof item.afectadoNombre === 'string') nameCandidates.push(item.afectadoNombre);
              if (typeof item.nombres_afectado === 'string') nameCandidates.push(item.nombres_afectado);
              // Also allow an object with nombres/apellidos
              if (typeof item.afectado === 'object' && item.afectado !== null) {
                if (item.afectado.nombres) nameCandidates.push(item.afectado.nombres);
                if (item.afectado.nombre) nameCandidates.push(item.afectado.nombre);
              }

              if (nameCandidates.length > 0) {
                const lowerCandidates = nameCandidates.map(s => String(s).toLowerCase().trim());
                indexAfectado = data.afectados.findIndex((af: any) => {
                  const full = `${af.nombres || ''} ${af.apellidos || ''}`.toLowerCase().trim();
                  const nombresOnly = String(af.nombres || '').toLowerCase().trim();
                  return lowerCandidates.some(c => c === full || c === nombresOnly || full.includes(c) || nombresOnly.includes(c));
                });
              }
            }
            if (indexAfectado === -1) indexAfectado = 0;
          } else {
            indexAfectado = 0;
          }


          if ((typeof item === 'object' && item !== null) && Array.isArray(ids_medidas)) {
            medidasArray.push(this.fb.group({
              idAfectado: [String(indexAfectado)],
              medidas: [ids_medidas]
            }));
          } else {
            console.warn('Item medida inválido, no se agrega al FormArray:', item);
          }
        });
      }

      // Cargar datos de violencia para mujeres si existen
      if (this.grupo === 'mujeres') {
        if (data.datosViolencia.tipoDeViolencia) {
          this.denunciaForm.get('tipoDeViolencia')?.setValue(data.datosViolencia.tipoDeViolencia);
        }
        if (data.datosViolencia.ambitoViolencia) {
          this.denunciaForm.get('ambitoViolencia')?.setValue(data.datosViolencia.ambitoViolencia);
        }
      }

    });
  }

  //---------------------OTROS----------------------///


  cambiarTab(tab: number) {
    this.currentTab = tab;
    const section = document.getElementById('mainSectionDenuncia');
if (section) section.scrollTop = 0;
  }
  bloquearNumTramite(): void {
    if (!this.numTramiteDisabled) {
      this.numTramiteDisabled = true;
      this.denunciaForm.get('num_tramite')?.disable();
    }
  }
  private setearNumTramite(numero: number): void {
    const numeroFormateado = this.formatearNumeroTramite(numero);
    this.denunciaForm.get('num_tramite')?.setValue(numeroFormateado);
    this.bloquearNumTramite();
  }

  private formatearNumeroTramite(numero: number, longitud: number = 4): string {
    return numero.toString().padStart(longitud, '0');
  }

  //---------------------------FUNCIONES CRUD FORMULARIO-------------------///
  cancelar(): void {
    this.router.navigate([this.grupo]);
  }

  handleAction(actionId: string) {
    switch (actionId) {
      case 'update':
        this.habilitarEdicion();
        break;
      case 'save':
        if (this.editMode) {
          this.updateDenuncia(this.idDenuncia);
        }else{
          this.GuardarDenuncia();
        }

        break;
      case 'pdf':
        this.generarPdf();
        break;
    }
  }
  habilitarEdicion(){
    this.isEditDenunciaActivate=true;
    this.denunciaForm.enable();
    this.actionsConfig[1].disabled = false
    this.actionsConfig[2].disabled = true
    this.actionsConfig[0].disabled = true;

  }

  updateDenuncia(id: number) {
    this.idDenuncia = id;
     const body = {
      ...this.denunciaForm.value,
      status: 'completada',
    };

    this.loading = true;

    this.denunciaService.actualizarDenuncia(this.idDenuncia, body).subscribe({
      next: () => {
        this.loading = false;
        toast.success('Denuncia Actualizada con Éxito', {
          duration: 3000,
        });
         this.actionsConfig[1].disabled = true
    this.actionsConfig[2].disabled = false
    this.actionsConfig[0].disabled = false;
    this.isEditDenunciaActivate=false;
    this.denunciaForm.disable();
      },
      error: (err) => {
        this.loading = false;
        toast.error('Error al Actualizar la Denuncia', {
          duration: 3000,
        });
      },
    });
  }

  GuardarDenuncia(): void {


    if (this.denunciaForm.invalid) {
      this.denunciaForm.markAllAsTouched();

      toast.error(' Campos Incompletos', {
          duration: 3000,
          description: 'Por Favor, Completa Todos los Campos Requeridos',
          // delete: true,
        });
      return;
    }

    // Construir el objeto final
    const body = {
      ...this.denunciaForm.value,
      //codigoTramite,
      status: 'completada',
    };


    this.loading = true;

    // Primero crear la denuncia en backend y usar la respuesta para generar/descargar PDF
    this.denunciaService.crearDenuncia(body).subscribe({
      next: (body) => {
        this.loading = false;
        this.idDenuncia = body.data.id;

        this.router.navigate(['../editar/'+ this.idDenuncia], { relativeTo: this.route });
        toast.success('Denuncia Guardada con Éxito', {
          duration: 3000,
        });


      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al guardar la denuncia';
        console.error(err);
      },
    });

  }

//---------------------------GENERAR PDF-------------------//
  generarPdf(){
    this.actionsConfig[2].disabled = true;
    this.pdfLoading = true;
    this.pdfError = null;
    this.pdfSrc = null;

    this.denunciaService.crearpdfBlob(this.idDenuncia).subscribe({
      next: (res: Blob) => {
        console.log('esta es el id del pdf', this.idDenuncia);

        if (res && res.size > 0) {
          const url = URL.createObjectURL(res);
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.pdfLoading = false;
        } else {
          this.pdfError = 'No se pudo generar el PDF. No hay datos suficientes.';
          this.pdfLoading = false;
        }

        this.actionsConfig[2].disabled = false;
      },
      error: (err) => {
        console.error('Error al generar PDF:', err);
        this.pdfError = 'Error al generar el PDF. Por favor intente nuevamente.';
        this.pdfLoading = false;
        this.actionsConfig[2].disabled = false;
      }
    });

    this.cambiarTab(2);
  }
}
export default NnaPageCrearDenunciaComponent;
