import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvocatoriaService } from '@nna/services/avocatoria.service';

@Component({
  selector: 'app-avocatoriaDetalles',
  templateUrl: './avocatoriaDetalles.component.html',
  imports: [CommonModule]
})
export class AvocatoriaDetallesComponent  {
  archivo: File | null = null;
  codigoTramite: string = '001-JCPD-Portoviejo-2025-NIÑOS'; // Asigna aquí el valor real dinámico si lo tienes
  dragging = false;

  constructor(private avocatoriaService: AvocatoriaService) {}

  onFileSelected(event: any) {
    this.archivo = event.target.files[0];
    console.log('Archivo seleccionado:', this.archivo);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.onFileSelected({ target: { files: event.dataTransfer.files } });
    }
  }

  subirArchivo() {
    if (!this.archivo) return;
    this.avocatoriaService.uploadArchivo(this.archivo, this.codigoTramite, 'denuncia')
      .subscribe({
        next: res => alert('Archivo subido correctamente'),
        error: err => alert('Error al subir archivo')
      });
  }
}
export default AvocatoriaDetallesComponent;
