import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DenunciaService } from '@nna/services/denuncia.service';



@Component({
  selector: 'app-nna-page-fases',
  templateUrl: './nna_page_fases.component.html',


  imports: [CommonModule, RouterLink]
})
export class NnaPageFasesComponent implements OnInit {
  denunciaId: number = 0;
  denuncia:any =null

  loading: boolean = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private denunciaServices:DenunciaService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      console.log(this.denunciaId)
      this.cargarDatosDenuncia()

    });
  }
  cargarDatosDenuncia(){
    this.denunciaServices.obtenerDenuncia(this.denunciaId).subscribe((data =>{
      this.denuncia =data
      console.log(data)
    }))
  }



}
export default NnaPageFasesComponent;
