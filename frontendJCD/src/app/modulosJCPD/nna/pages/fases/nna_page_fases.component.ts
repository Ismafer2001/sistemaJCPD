import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DenunciaService } from '@nna/services/denuncia.service';
import { FasesService } from '@nna/services/fases.service';
import FasesCardComponent from './componentes/fases-card/fases-card.component';
import { forkJoin } from 'rxjs';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

interface Estatus {

}

@Component({
  selector: 'app-nna-page-fases',
  templateUrl: './nna_page_fases.component.html',


  imports: [CommonModule, RouterLink, FasesCardComponent,ButtonSubmitComponent]
})
export class NnaPageFasesComponent implements OnInit {
  denunciaId: number = 0;
  denuncia:any =null

  loading: boolean = true;
  error: string | null = null;
  avocatoria:string =''
  notificacion: string = '';
  cita: string = '';
  audienciaC: string = '';
  audienciaP: string = '';
  denunciastatus:string ='';
 tarjetasAvocatoria: any[] = [];



  constructor(private route: ActivatedRoute, private denunciaServices:DenunciaService, private fasesService:FasesService) {}
ngOnInit() {
  this.route.params.subscribe(params => {
    this.denunciaId = +params['id'];

    forkJoin({
      denuncia: this.denunciaServices.obtenerDenuncia(this.denunciaId),
      estatus: this.fasesService.getEstatus(this.denunciaId)
    }).subscribe(({ denuncia, estatus }) => {
      this.denuncia = denuncia;
      this.denunciastatus = estatus.denuncia;
      this.avocatoria = estatus.avocatoria;
      this.notificacion = estatus.notificacion;
      this.cita = estatus.citacion;
      this.audienciaC = estatus.audienciaC;
      this.audienciaP = estatus.audienciaP;

      console.log('Denuncia:', this.denuncia
        ,'  Estatus:', estatus
      )
      console.log('avocatoria:', this.avocatoria);



      this.armarArrayFases();

    });
  });
}


  //-----------armar array de fases---------///
  armarArrayFases(){
     this.tarjetasAvocatoria = [
       {
    titulo: 'Denuncia',
    estatus: this.denunciastatus,
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/denuncia',
    linkDetalles: '/nna/detalle-denuncia'
  },
  {
    titulo: 'Avocatoria',
    estatus: this.avocatoria,
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/avocatoria',
    linkDetalles: '/nna/detalle-vocatoria'
  },

  {
    titulo: 'Notificaciónes',
    estatus: this.notificacion,
    idDenuncia: this.denuncia?.idDenuncia ,
    link: '/nna/notificaciones',
    linkDetalles: '/nna/detalle-notificacion'
  },
   {
    titulo: 'Citaciones',
    estatus: this.cita,
    idDenuncia: this.denuncia?.idDenuncia ,
    link: '/nna/citaciones',
    linkDetalles: '/nna/detalle-citaciones'
  },
  {
    titulo: 'Audiencia de Contestacion',
    estatus: this.audienciaC,
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/audienciaDeContestacion',
    linkDetalles: '/nna/detalle-audiencia-constestacion'
  }
  ,
  {
    titulo: 'Audiencia de Pruebas',
    estatus: this.audienciaP,
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/audienciaDePruebas',
    linkDetalles: '/nna/detalle-audiencia-pruebas'
  }
  ,
  {
    titulo: 'Resoluciones',
    estatus: 'pendiente',
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/resoluciones',
    linkDetalles: '/nna/detalle-resoluciones'
  }
  ,
  {
    titulo: 'Cumplimiento de medidas',
    estatus: 'pendiente',
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/seguimiento',
    linkDetalles: '/nna/detalle-seguimiento'
  }
  ,
  {
    titulo: 'Control de impugnacion',
    estatus: 'pendiente',
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/impugnacion',
    linkDetalles: '/nna/detalle-impugnacion'
  }
  ,
  {
    titulo: 'Cierre de caso',
    estatus: 'pendiente',
    idDenuncia: this.denuncia?.idDenuncia,
    link: '/nna/cierreDeCaso',
    linkDetalles: '/nna/detalle-cierre'
  }
];



  }





}
export default NnaPageFasesComponent;
