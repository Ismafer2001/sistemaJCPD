import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Fase {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  fecha_inicio?: Date;
  fecha_fin?: Date;
}

@Component({
  selector: 'app-nna-page-fases',
  templateUrl: './nna_page_fases.component.html',

  
  imports: [CommonModule, RouterLink]
})
export class NnaPageFasesComponent implements OnInit {
  denunciaId: number = 0;
  fases: Fase[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      this.cargarFases();
    });
  }

  cargarFases() {
    // Aquí irá la lógica para cargar las fases desde el backend
    // Por ahora usamos datos de ejemplo
    this.fases = [
      {
        id: 1,
        nombre: 'Recepción de Denuncia',
        descripcion: 'Fase inicial donde se recibe y registra la denuncia',
        estado: 'completada',
        fecha_inicio: new Date('2024-03-01'),
        fecha_fin: new Date('2024-03-02')
      },
      {
        id: 2,
        nombre: 'Evaluación Inicial',
        descripcion: 'Análisis inicial de la denuncia y determinación de medidas urgentes',
        estado: 'en_proceso',
        fecha_inicio: new Date('2024-03-03')
      },
      {
        id: 3,
        nombre: 'Investigación',
        descripcion: 'Recopilación de evidencia y entrevistas',
        estado: 'pendiente'
      }
    ];
    this.loading = false;
  }

  actualizarEstadoFase(faseId: number, nuevoEstado: 'pendiente' | 'en_proceso' | 'completada') {
    // Aquí irá la lógica para actualizar el estado de la fase en el backend
    const fase = this.fases.find(f => f.id === faseId);
    if (fase) {
      fase.estado = nuevoEstado;
      if (nuevoEstado === 'en_proceso' && !fase.fecha_inicio) {
        fase.fecha_inicio = new Date();
      } else if (nuevoEstado === 'completada' && !fase.fecha_fin) {
        fase.fecha_fin = new Date();
      }
    }
  }
}
export default NnaPageFasesComponent;
