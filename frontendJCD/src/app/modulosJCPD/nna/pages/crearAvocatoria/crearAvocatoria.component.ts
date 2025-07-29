import { Component, OnInit } from '@angular/core';
import { AvocatoriaService } from '../../services/avocatoria.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import TablaComponent from '@shared/components/tabla/tabla.component';
import { DenunciaService } from '@nna/services/denuncia.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-crearAvocatoria',
  templateUrl: './crearAvocatoria.component.html',
  imports: [CommonModule, TablaComponent,ReactiveFormsModule],
})
export class CrearAvocatoriaComponent implements OnInit {

  denunciaAvocatoria: any = null;
  medidasIdenificadas: [] = [];
  denunciaId: number = 0;
  currentTab = 0;
  fechaHoraActual: Date = new Date();


  avocatoriaForm: FormGroup

  constructor(private avocatoriaService: AvocatoriaService, private route: ActivatedRoute, private denunciaService:DenunciaService, private fb:FormBuilder )
  {
    this.avocatoriaForm=this.fb.group({
       fechaActual: [this.fechaHoraActual.toISOString().split('T')[0],
        Validators.required

      ],
       horaActual: [this.fechaHoraActual.toTimeString().split(':').slice(0, 2).join(':'),
        Validators.required

      ],
       dispocisiones: ["",
        Validators.required

      ],
      mediasEmergentes: this.fb.array([]),

    })
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];

      this.loadDenunciaParaAvocatoria(this.denunciaId)
      //this.loadMedidasIDentificadas(this.denunciaId)


    });
    // Cambia el id según lo que necesites
  }

  loadDenunciaParaAvocatoria(id: number) {
    this.avocatoriaService.obtenerDenunciaParaAvocatoria(id).subscribe({
      next: (data) => {
        this.denunciaAvocatoria = data;
        console.log(data)
      },
      error: (err) => {
        console.error('Error al cargar la denuncia para avocatoria', err);
      }
    });
  }

   cambiarTab(tab: number) {
    this.currentTab = tab;
  }
  /*loadMedidasIDentificadas(id:number){
    this.avocatoriaService.getMedidasIdentificadas(id).subscribe(data=>{
      this.medidasIdenificadas=data
      console.log(data)


    })
  }*/


}
export default CrearAvocatoriaComponent
