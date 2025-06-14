import { CommonModule } from "@angular/common";
import { Component,OnInit,} from "@angular/core";
import { RouterLink } from "@angular/router";
import { DenunciaService } from "@nna/services/denuncia.service";
@Component({
    selector:'nna-page-nna',
    imports:[RouterLink,CommonModule],
    templateUrl:'./nna_page_nna.component.html',

})
export class NnaPageNnaComponent implements OnInit {
  denuncias: any[] = [];

  constructor(private denunciaService: DenunciaService) {}

  ngOnInit(): void {

  }

  

}
export default NnaPageNnaComponent;
