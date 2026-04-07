import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DenunciaService } from '@nna/services/denuncia.service';
import { FasesService } from '@nna/services/fases.service';
import FasesCardComponent from './componentes/fases-card/fases-card.component';
import { forkJoin, Subject } from 'rxjs';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';


interface Estatus {

}

@Component({
  selector: 'app-nna-page-fases',
  templateUrl: './nna_page_fases.component.html',


  imports: [CommonModule, RouterLink, FasesCardComponent]
})
export class NnaPageFasesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  denunciaId: number = 0;
  denuncia:any =null
  grupo:string ='nna'

  loading: boolean = true;
  error: string | null = null;
  avocatoria:string =''
  providencia: string = '';
  notificacion: string = '';
  cita: string = '';
  audienciaC: string = '';
  audienciaP: string = '';
  resoluciones:string ='';
  cumplimientoMedidas:string ='';
  controlImpugnacion:string ='';
  desestimiento:string ='';
  cierreCaso:string ='';
  denunciastatus:string ='';
 tarjetasFases: any[] = [];
 // Configuración de grupos válidos
  private gruposValidos = ['nna', 'adultos', 'mujeres'];

 // Propiedades para el dropdown
 isDropdownOpen: boolean = false;



  constructor(private route: ActivatedRoute,
     private denunciaServices:DenunciaService,
      private fasesService:FasesService,
       private router: Router,
      ) {}

ngOnInit() {


  this.route.params.subscribe(params => {
    this.denunciaId = +params['id'];
    this.loading = true;
    this.error = null;

      forkJoin({
        denuncia: this.denunciaServices.obtenerDenuncia(this.denunciaId),
        estatus: this.fasesService.getEstatus(this.denunciaId),
      }).subscribe({
        next: ({ denuncia, estatus }) => {
          this.denuncia = denuncia;
          this.denunciastatus = estatus.denuncia;
          this.avocatoria = estatus.avocatoria;
          this.providencia = estatus.providencia;
          this.notificacion = estatus.notificacion;
          this.cita = estatus.citacion;
          this.audienciaC = estatus.audienciaC;
          this.audienciaP = estatus.audienciaP;
          this.resoluciones = estatus.resoluciones;
          this.cumplimientoMedidas = estatus.cumplimientoMedidas;
          this.controlImpugnacion = estatus.controlImpugnacion;
          this.desestimiento = estatus.desestimiento;
          this.cierreCaso = estatus.cierreCaso;
          this.armarArrayFases();

          /*if(this.grupo === 'mujeres'){
            this.armararrayFasesMujeres();
          }else{
            this.armarArrayFases();
          }*/

          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos del trámite:', error);
          this.error = error.error?.message || 'Error al cargar la información del trámite';
          this.loading = false;
        }
      });

  });

}
ngOnDestroy() {

    this.destroy$.next();
    this.destroy$.complete();
  }


  //-----------armar array de fases---------///
  armarArrayFases(){
     this.tarjetasFases = [
       {
    titulo: 'Denuncia',
    estatus:this.denunciastatus,
    link: `/${this.grupo}/denuncia`,
    linkDetalles: '/nna/detalle-denuncia',
    idDenuncia: this.denuncia?.idDenuncia,

    faseAnterior: this.denunciastatus,
  },
  {
    titulo: 'Avocatoria',
    estatus: this.avocatoria,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/avocatoria`,
    linkDetalles: '/nna/detalle-vocatoria',
    faseAnterior: this.denunciastatus,
  },

  {
    titulo: 'Providencia',
    estatus: this.providencia,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/providencia`,
    linkDetalles: '/nna/detalle-providencia',
    faseAnterior: this.avocatoria,
  },

  {
    titulo: 'Notificaciónes',
    estatus: this.notificacion,
    idDenuncia: this.denuncia?.idDenuncia ,
    link: `/${this.grupo}/notificaciones`,
    linkDetalles: '/nna/detalle-notificacion',
    faseAnterior: this.avocatoria,
    isQueryParams:true
  },
   {
    titulo: 'Citaciones',
    estatus: this.cita,
    idDenuncia: this.denuncia?.idDenuncia ,
    link: `/${this.grupo}/citaciones`,
    linkDetalles: '/nna/detalle-citaciones',
    faseAnterior: this.notificacion,
    isQueryParams:true
  },
  {
    titulo: 'Audiencia de Contestacion',
    estatus: this.audienciaC,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/audienciaDeContestacion`,
    linkDetalles: '/nna/detalle-audiencia-constestacion'
    ,
    faseAnterior: this.cita,
  }
  ,
  {
    titulo: 'Audiencia de Pruebas',
    estatus: this.audienciaP,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/audienciaDePruebas`,
    linkDetalles: '/nna/detalle-audiencia-pruebas'
    ,
    faseAnterior: this.audienciaC,
  }
  ,
  {
    titulo: 'Resoluciones',
    estatus: this.resoluciones,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/resoluciones`,
    linkDetalles: '/nna/detalle-resoluciones',
    faseAnterior: this.audienciaC,
  }
  ,
  {
    titulo: 'Seguimiento de medidas',
    estatus: this.cumplimientoMedidas,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/seguimiento`,
    linkDetalles: '/nna/detalle-seguimiento',
    faseAnterior: this.resoluciones
  }
  ,
  {
    titulo: 'Control de impugnacion',
    estatus: this.controlImpugnacion,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/impugnacion`,
    linkDetalles: '/nna/detalle-impugnacion',
    faseAnterior: this.cumplimientoMedidas,
  }
  ,
  {
    titulo: 'Desestimiento',
    estatus: this.desestimiento,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/desestimiento`,
    linkDetalles: '/nna/detalle-desestimiento',
    faseAnterior: this.cumplimientoMedidas,
  }
  ,
  {
    titulo: 'Cierre de caso',
    estatus: this.cierreCaso,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/cierreDeCaso`,
    linkDetalles: '/nna/detalle-cierre',
    faseAnterior: this.controlImpugnacion,
  }
];

  }

  /*OPCIONAL si se usara el mismo componente para listar las fases*/
  /*armararrayFasesMujeres(){
         this.tarjetasFases = [
       {
    titulo: 'Denuncia',
    estatus:this.denunciastatus,
    link: `/${this.grupo}/denuncia`,
    linkDetalles: '/nna/detalle-denuncia',
    idDenuncia: this.denuncia?.idDenuncia,

    faseAnterior: this.denunciastatus,
  },
  {
    titulo: 'Otorgamiento',
    estatus: this.avocatoria,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/avocatoria`,
    linkDetalles: '/nna/detalle-vocatoria',
    faseAnterior: this.denunciastatus,
  },

  {
    titulo: 'Notificaciónes',
    estatus: this.notificacion,
    idDenuncia: this.denuncia?.idDenuncia ,
    link: `/${this.grupo}/notificaciones`,
    linkDetalles: '/nna/detalle-notificacion',
    faseAnterior: this.avocatoria,
    isQueryParams:true
  },

  {
    titulo: 'Legalizacion',
    estatus: this.audienciaC,
    idDenuncia: this.denuncia?.idDenuncia,
    link: `/${this.grupo}/audienciaDeContestacion`,
    linkDetalles: '/nna/detalle-audiencia-constestacion'
    ,
    faseAnterior: this.cita,
  }

];

  }*/

  // Métodos para el dropdown
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onInhibirse(): void {

  this.router.navigate([`/${this.grupo}/inhibicion`, this.denunciaId]);
    this.isDropdownOpen = false;
  }

  onCrearOficio(): void {

    this.router.navigate([`/${this.grupo}/informes`, this.denunciaId]);
    this.isDropdownOpen = false;
  }

   onSubirExpediente(): void {

    this.router.navigate([`/${this.grupo}/expediente`, this.denunciaId]);
    this.isDropdownOpen = false;
  }


}
export default NnaPageFasesComponent;
