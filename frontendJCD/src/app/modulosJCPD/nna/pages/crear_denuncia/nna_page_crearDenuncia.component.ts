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
import { ActivatedRoute, Router } from '@angular/router';
import { Nna_creardenuncia_denuncianteComponent } from './componentes/denunciante/nna_creardenuncia_denunciante.component';
import { Nna_creardenuncia_afectadoComponent } from './componentes/afectado/nna_creardenuncia_afectado.component';
import { Nna_creardenuncia_denunciadoComponent } from './componentes/denunciado/nna_creardenuncia_denunciado.component';
import { Nna_creardenuncia_vulneracionesComponent } from './componentes/vulneraciones/nna_creardenuncia_vulneraciones.component';
import { Crear_denuncia_medidasComponent } from './componentes/medidas/crear_denuncia_medidas.component';
import { AuthService } from '@auth/services/auth.service';
import { CardFormComponent } from '@shared/components/card-Form/card-Form.component';
import { validarCedulaEcuador } from '@shared/validators/cedula.validators';
import {ButtonSubmitComponent} from '@shared/components/button-submit/button-submit.component';
import { toast } from 'ngx-sonner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
    CardFormComponent, ButtonSubmitComponent
  ],
})
export class NnaPageCrearDenunciaComponent implements OnInit {

  existeAvocatoria: any = null;

  private ignoreFirstValueChange = false;
  private cargandoDatosEdicion = false; // Nueva flag para ignorar cambios durante carga
  numTramiteDisabled = true;
  currentTab = 0; //variable para cambiar pestañas del formulario
  denunciaForm!: FormGroup;
  incrementar = false;
  denunciaedit:any =null;
  editMode: boolean = false;

  loading = false;
  error: string | null = null;
  // Variable para el cantón
  anioActual!: number;
  canton!: string;
  pdfSrc: SafeResourceUrl | null = null;
  idDenuncia!: number;

  // Estados internos para los botones (sin la lógica de avocatoria)
  private _pdfDisabled: boolean = true;
  private _guardarDisabled: boolean = false;
  private _editarDisabled: boolean = true;

  // Estados para los botones que se calculan explícitamente
  pdfDisabled: boolean = true;
  guardarDisabled: boolean = false;
  editarDisabled: boolean = true;

  // Método para actualizar los estados de los botones
  private actualizarEstadoBotones(): void {
    // PDF: Si existe avocatoria, siempre activo. Si no, respeta el estado manual
    this.pdfDisabled = this.existeAvocatoria ? false : this._pdfDisabled;

    // Guardar: Si existe avocatoria, siempre deshabilitado. Si no, respeta el estado manual
    this.guardarDisabled = this.existeAvocatoria ? true : this._guardarDisabled;

    // Editar: Si existe avocatoria, siempre deshabilitado. Si no, respeta el estado manual
    this.editarDisabled = this.existeAvocatoria ? true : this._editarDisabled;
  }

  vulneracionesCatalogo: Vulneracion[] = [];
  medidasPorArticulo: ArticuloMedidas[] = [];

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
    // Cargar catálogo de vulneraciones para mapear nombres a IDs
    this.vulneracionService.getVulneraciones().subscribe({
      next: (data) => {
        this.vulneracionesCatalogo = data;
      },
      error: (error) => {
        console.error('Error al cargar vulneraciones:', error);
      }
    });
    // Cargar catálogo de medidas para mapear nombres a IDs
    this.medidasService.getAllMedidas().subscribe({
      next: (response) => {
        if (response && response.success) {
          this.medidasPorArticulo = response.data || [];
        } else if (Array.isArray(response)) {
          this.medidasPorArticulo = response as ArticuloMedidas[];
        }
      },
      error: (err) => {
        console.error('Error al cargar medidas:', err);
      }
    });
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.idDenuncia = +params['id'];
        console.log('Modo Edición Activado para ID:', this.idDenuncia);
        // En modo editar, inicializar estados: PDF habilitado, Editar deshabilitado hasta detectar cambios
        this._guardarDisabled = true;
        this._pdfDisabled = false;  // PDF habilitado
        this._editarDisabled = true; // Editar deshabilitado hasta que haya cambios
        this.actualizarEstadoBotones();
      }
    });

    this.denunciaFormulario();

    this.AuthService.getUsuarioActual().subscribe((user) => {
      this.denunciaForm.get('id_canton')?.setValue(user.id_canton);
      this.canton = user.canton;
    });

    if (!this.editMode) {
      this.denunciaService.obtenerNumTramite('nna').subscribe((res) => {
        if (res.numero) {
          this.denunciaService.obtenerNumTramite('nna', true).subscribe((res2) => {
            this.setearNumTramite(res2.numero);
          });
        } else {
          this.numTramiteDisabled = false;
          this.denunciaForm.get('num_tramite')?.enable();
        }
      });
      // Suscripción para modo creación
      this.denunciaForm.valueChanges.subscribe((data) => {
        console.log('Formulario cambiado:', data);

        if (!this.guardarDisabled) return; // Solo si ya se guardó
        this._pdfDisabled = true;
        this._editarDisabled = false;
        this.actualizarEstadoBotones();
      });
    } else {
      // Cargar datos y luego suscribirse a valueChanges para evitar que se dispare al hacer patchValue
      this.cargarDatosEdicion(this.idDenuncia);

    }

  }


  //--------- CREACION FORMULARIO--------------------//
  denunciaFormulario() {
    this.anioActual = new Date().getFullYear();
    this.canton = '';

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
      medio: ['', Validators.required],

      anio: [this.anioActual],

      denunciante: this.fb.group({
        cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'),validarCedulaEcuador] ],
        nombres: ['', [Validators.required, Validators.minLength(2)]],
        apellidos: ['', [Validators.required, Validators.minLength(2)]],
        edad: [
          '',
          [Validators.required, Validators.min(0), Validators.max(120)],
        ],
        sexo: ['', Validators.required],

        nacionalidad: ['', Validators.required],
        direccion: ['', [Validators.required, Validators.minLength(5)]],
        mail: ['', [Validators.required, Validators.email]],
        telefono: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
        ],
      }),
      afectados: this.fb.array([], [Validators.required]),
      denunciados: this.fb.array([], Validators.required),
      descripcion_hechos: ['', [Validators.required, Validators.minLength(10)]],
      solicitud: ['', [Validators.required, Validators.minLength(10)]],
      vulneraciones: this.fb.array([], [Validators.required]),
      medidas: this.fb.array([], [Validators.required]),
      id_canton: [],
      grupoPrioritario: ['nna'],
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

  //CARGA DE DATOS EN MODO EDICION
  cargarDatosEdicion(id: number): void {
    // Estados iniciales para modo editar sin avocatoria
    this._pdfDisabled = false;    // PDF habilitado
    this._editarDisabled = true;  // Editar deshabilitado hasta detectar cambios
    this.cargandoDatosEdicion = true; // Marcar que estamos cargando datos
    this.actualizarEstadoBotones();
    this.ignoreFirstValueChange = true;

    this.denunciaForm.valueChanges.subscribe((data) => {
      if (this.ignoreFirstValueChange) {
        this.ignoreFirstValueChange = false;
        return;
      }

      // Ignorar cambios mientras estamos cargando datos de edición
      if (this.cargandoDatosEdicion) {
        return;
      }

      // Cuando hay cambios reales del usuario, deshabilitar PDF y habilitar editar
      this._pdfDisabled = true;
      this._editarDisabled = false;
      this.actualizarEstadoBotones();
    });


    this.denunciaService.obtenerDenunciaEditMode(id).subscribe(data => {
      this.denunciaedit = data.denuncia;
      console.log('Denuncia en modo edición:', data);
      this.ignoreFirstValueChange = true;
      this.existeAvocatoria=data.denuncia.avocatoria
      this.actualizarEstadoBotones(); // Actualizar estados después de cargar avocatoria
      this.denunciaForm.patchValue(this.denunciaedit);

      if(this.existeAvocatoria){
        this.denunciaForm.disable();
        // Con avocatoria, la lógica se maneja automáticamente por los métodos
        this.actualizarEstadoBotones();
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
          console.log('Item medida a procesar:', item);
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
                for (const articulo of this.medidasPorArticulo) {
                  if (!Array.isArray(articulo.medidas)) continue;
                  const found = articulo.medidas.find((mm: Medida) => {
                    const a = String(mm.medida || '').toLowerCase().trim();
                    const b = trimmed.toLowerCase();
                    return a === b || a.includes(b) || b.includes(a);
                  });
                  if (found) return String(found.id);
                }
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
          console.log( 'con medidas IDs:', item.medida);

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

      // Marcar que terminó la carga de datos para permitir detectar cambios reales del usuario
      setTimeout(() => {
        this.cargandoDatosEdicion = false;
      }, 100); // Pequeño delay para asegurar que todos los patchValue hayan terminado

    });
  }

  //---------------------OTROS----------------------///


  cambiarTab(tab: number) {
    this.currentTab = tab;
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
    this.router.navigate(['/nna']);
  }

  updateDenuncia(id: number) {
    this.idDenuncia = id;
     const body = {
      ...this.denunciaForm.value,
      status: 'completada',
    };
    this.denunciaService.actualizarDenuncia(this.idDenuncia, body).subscribe({
      next: () => {
        toast.success('Denuncia Actualizada con Éxito', {
          duration: 3000,
        });
        this._pdfDisabled = false;
        this._editarDisabled = true;
        this.actualizarEstadoBotones();
      },
      error: (err) => {
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
    // Construir el código de trámite
    const numTramite = this.denunciaForm.get('num_tramite')?.value;
    const codigoTramite = `${numTramite}-JCPD-${this.canton}-${this.anioActual}-NIÑOS`;

    // Construir el objeto final
    const body = {
      ...this.denunciaForm.value,
      codigoTramite,
      status: 'completada',
    };

    this.loading = true;

    // Primero crear la denuncia en backend y usar la respuesta para generar/descargar PDF
    this.denunciaService.crearDenuncia(body).subscribe({
      next: (body) => {
        this.loading = false;
        this.idDenuncia = body.data.id;
        toast.success('Denuncia Guardada con Éxito', {
          duration: 3000,
        });
        this._pdfDisabled = false;
        this._guardarDisabled = true;
        this.actualizarEstadoBotones();

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

    this.denunciaService.crearpdfBlob(this.idDenuncia).subscribe((res: Blob) => {
      console.log('esta es el id del pdf', this.idDenuncia);
      const url = URL.createObjectURL(res);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
    this.cambiarTab(2);
  }
}
export default NnaPageCrearDenunciaComponent;
