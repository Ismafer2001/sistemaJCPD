import { Component, OnInit } from '@angular/core';
import { AvocatoriaService } from '../../services/avocatoria.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crearAvocatoria',
  templateUrl: './crearAvocatoria.component.html',
  imports: [CommonModule],
})
export class CrearAvocatoriaComponent implements OnInit {

  denunciaAvocatoria: any = null;
  denunciaId: number = 0;
  fechaHoraActual: Date = new Date();

  constructor(private avocatoriaService: AvocatoriaService, private route: ActivatedRoute ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      this.loadDenunciaParaAvocatoria(this.denunciaId)

    });
    // Cambia el id según lo que necesites
  }

  loadDenunciaParaAvocatoria(id: number) {
    this.avocatoriaService.obtenerDenunciaParaAvocatoria(id).subscribe({
      next: (data) => {
        this.denunciaAvocatoria = data;
      },
      error: (err) => {
        console.error('Error al cargar la denuncia para avocatoria', err);
      }
    });
  }

}
export default CrearAvocatoriaComponent
