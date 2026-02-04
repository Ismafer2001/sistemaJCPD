

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { WebSocketService } from '@shared/services/web-socket.service';
import { InhibirseService } from '../../../modulosJCPD/nna/services/inhibirse.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
  selector: 'globla-header',
  imports: [CommonModule,RouterLink],
  templateUrl: './header.component.html',


})
export class headerComponent implements OnInit, OnDestroy {
  @Input() moduloActual: string = '';
  nombreUsuario: string = '';
  rolUsuario: string = '';
  cantonUsuario: string = '';
  idCantonUsuario: number = 0;
  private destroy$ = new Subject<void>();
  mostrarMenuUsuario = false;
  mostrarNotificaciones = false;
  nombreModulo: string = "";

  // Propiedades para notificaciones
  notificacionesNoLeidas: number = 0;
  notificaciones: any[] = [];

  // Configuración de módulos
  private modulosConfig = {
    'nna': 'Niñez y Adolescencia',
    'adultos': 'Adultos Mayores',
    'mujeres': 'Mujeres Victima de Violencia'
  };

  constructor(
    private AuthService: AuthService,
    private route: ActivatedRoute,
    private webSocketService: WebSocketService,
    private inhibirseService: InhibirseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const grupo = params['grupo'];
      this.nombreModulo = this.modulosConfig[grupo as keyof typeof this.modulosConfig] || 'Junta Cantonal de Protección de Derechos';

      console.log('Grupo actual:', grupo);
    });

    this.AuthService.getUsuarioActual()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.nombreUsuario = user.nombres;
        this.rolUsuario = user.rol;
        this.cantonUsuario = user.canton;
        this.idCantonUsuario = user.id_canton || 0;
        console.log(user);

        // Conectar al WebSocket una vez que tenemos los datos del usuario
        // Solo si NO es admin
        if (this.idCantonUsuario && this.rolUsuario.toLowerCase() !== 'admin') {
          this.inicializarWebSocket();
        } else if (this.rolUsuario.toLowerCase() === 'admin') {
          console.log('👨‍💼 Usuario admin detectado - No se conecta al WebSocket');
        }
      });
  }

  toggleMenu() {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
  }

  cerrarMenu() {
    this.mostrarMenuUsuario = false;
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    // Si se abren las notificaciones, marcar como leídas
    if (this.mostrarNotificaciones) {
      this.notificacionesNoLeidas = 0;
    }
  }

  cerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  // Método para verificar si debe mostrar notificaciones (no admin)
  deberMostrarNotificaciones(): boolean {
    return this.rolUsuario.toLowerCase() !== 'admin';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as Element;
    if (!target.closest('.notifications-container')) {
      this.mostrarNotificaciones = false;
      this.mostrarMenuUsuario = false;
    }
  }

  private inicializarWebSocket(): void {
    console.log('🔗 Inicializando WebSocket para cantón:', this.idCantonUsuario);

    // Conectar al WebSocket
    this.webSocketService.conectar(this.idCantonUsuario);

    // Cargar deprecatorias pendientes al inicio para mantener notificaciones después del refresh
    this.cargarDeprecatoriasPendientes();

    // Escuchar nuevos casos remitidos
    this.webSocketService.escucharNuevosCasos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('🔔 Datos recibidos en header:', data);
          this.procesarNuevosDatos(data);
        },
        error: (error) => {
          console.error('❌ Error al escuchar notificaciones:', error);
        }
      });
  }

  private cargarDeprecatoriasPendientes(): void {
    console.log('📋 Cargando deprecatorias pendientes para cantón:', this.idCantonUsuario);

    this.inhibirseService.getDeprecatoriasPendientes(this.idCantonUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (deprecatoriasPendientes) => {
          console.log('📥 Deprecatorias pendientes cargadas:', deprecatoriasPendientes);

          if (deprecatoriasPendientes && deprecatoriasPendientes.length > 0) {
            // Procesar cada deprecatoria pendiente como notificación
            console.log(`📦 Procesando ${deprecatoriasPendientes.length} deprecatorias pendientes`);
            deprecatoriasPendientes.forEach((deprecatoria: any) => {
              this.agregarNotificacionPendiente(deprecatoria);
            });

            console.log(`✅ Se cargaron ${deprecatoriasPendientes.length} notificaciones pendientes`);
          } else {
            console.log('ℹ️ No hay deprecatorias pendientes');
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar deprecatorias pendientes:', error);
        }
      });
  }

  private agregarNotificacionPendiente(deprecatoria: any): void {
    console.log('🔎 Procesando deprecatoria pendiente:', deprecatoria);
    console.log('📁 Notificaciones actuales antes:', this.notificaciones.length);

    // Agregar notificación de deprecatoria pendiente
    const notificacionExistente = this.notificaciones.find(n =>
      n.datos?.codigoTramite === deprecatoria.codigoTramite
    );

    if (!notificacionExistente) {
      console.log('✅ Agregando nueva notificación pendiente:', deprecatoria.codigoTramite);
      this.notificaciones.push({
        id: deprecatoria.id || Date.now() + Math.random(),
        mensaje: `Tiene una denuncia remitida: ${deprecatoria.codigoTramite || 'Sin número'}`,
        fecha: new Date(deprecatoria.fechaCreacion || deprecatoria.created_at || Date.now()),
        tipo: 'denuncia_remitida',
        datos: deprecatoria
      });

      // Incrementar contador para casos pendientes
      this.notificacionesNoLeidas++;
      console.log('📈 Contador actualizado:', this.notificacionesNoLeidas, 'Total notificaciones:', this.notificaciones.length);
    } else {
      console.log('⚠️ Notificación pendiente duplicada ignorada:', deprecatoria.codigoTramite || deprecatoria.id);
    }
  }

  private procesarNuevosDatos(data: any): void {
    // Verificar si es un array o un objeto individual
    if (Array.isArray(data)) {
      console.log(`📦 Procesando ${data.length} notificaciones del array`);
      data.forEach((caso: any) => {
        this.agregarNotificacionNueva(caso);
      });
    } else {
      console.log('📝 Procesando notificación individual');
      this.agregarNotificacionNueva(data);
    }
  }

  private agregarNotificacionNueva(caso: any): void {
    console.log('🔎 Procesando caso nuevo:', caso);
    console.log('📁 Notificaciones actuales antes:', this.notificaciones.length);

    // Verificar si ya existe esta notificación para evitar duplicados
    const notificacionExistente = this.notificaciones.find(n =>
      n.datos?.codigoTramite === caso.codigoTramite
    );

    if (!notificacionExistente) {
      console.log('✅ Agregando nueva notificación:', caso.codigoTramite);
      // Agregar la nueva notificación al inicio del array
      this.notificaciones.unshift({
        id: caso.id || Date.now(),
        mensaje: `Tiene una denuncia remitida: ${caso.codigoTramite || 'Sin número'}`,
        fecha: new Date(),
        tipo: 'denuncia_remitida',
        datos: caso
      });

      // Incrementar contador de no leídas
      this.notificacionesNoLeidas++;

      // Limitar el número de notificaciones almacenadas (máximo 50)
      if (this.notificaciones.length > 50) {
        this.notificaciones = this.notificaciones.slice(0, 50);
      }

      console.log(`📊 Nueva notificación agregada. Total: ${this.notificaciones.length}, No leídas: ${this.notificacionesNoLeidas}`);
    } else {
      console.log('⚠️ Notificación duplicada ignorada:', caso.codigoTramite || caso.id);
      console.log('🔍 Notificación existente encontrada:', notificacionExistente);
    }
  }

  ngOnDestroy(): void {
    console.log('🔄 Desconectando WebSocket desde header...');
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.desconectar();
  }

}
export default headerComponent;

