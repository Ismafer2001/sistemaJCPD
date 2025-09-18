import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { VulneracionService, Vulneracion } from '../../../../services/vulneracion.service';
import { CommonModule } from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';
import TablaEditComponent from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { toast } from 'ngx-sonner';


@Component({
  selector: 'app-nna_creardenuncia_vulneraciones',
  templateUrl: './nna_creardenuncia_vulneraciones.component.html',

  imports: [CommonModule, ReactiveFormsModule,MatCheckboxModule,ButtonSubmitComponent,TablaEditComponent]
})
export class Nna_creardenuncia_vulneracionesComponent implements OnInit {
    @Input() formArray!: FormArray;
    @Input() formAfectados!: FormArray;
    vulneracionesForm: FormGroup;
    vulneraciones: Vulneracion[] = [];


  constructor(
    private vulneracionService: VulneracionService,
    private fb: FormBuilder
  ) {
    this.vulneracionesForm = this.fb.group({
      id_afectado: ["", [Validators.required, Validators.minLength(1)]],
      vulneraciones: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarVulneraciones();
    this.vulneracionesForm.valueChanges.subscribe(nna => {
      console.log(this.formArray.value)
    });
  }


get mapeoAfectados() {
  return this.formArray.value.map((item: any) => {
    const afectado = this.formAfectados.at(item.id_afectado)?.value;
    const vulneracionesNombres = item.vulneraciones.map((id: number) => {
      const v = this.vulneraciones.find(v => v.id === id);
      return v ? v.vulneracion : 'Desconocido';
    });

    return {
      ...item,
      id_afectado: afectado ? afectado.nombres : 'Desconocido',
      vulneraciones: vulneracionesNombres.join('\n -')
    };
  });
}


  cargarVulneraciones(): void {
    this.vulneracionService.getVulneraciones().subscribe({
      next: (data) => {
        this.vulneraciones = data;
        // Inicializar los controles del formulario para cada vulneración

      },
      error: (error) => {
        console.error('Error al cargar vulneraciones:', error);
      }
    });
  }
   toggleVulneracion(vulneraciones: number): void {
  const control = this.vulneracionesForm.get('vulneraciones');



  if (!control) return;

  const current = Array.isArray(control.value) ? control.value : [];

  const updated = current.includes(vulneraciones)
    ? current.filter(id => id !== vulneraciones)
    : [...current, vulneraciones];

  control.setValue(updated, { emitEvent: true });
}


  isVulneracionSelected(vulneraciones: number): boolean {
  const control = this.vulneracionesForm.get('vulneraciones');
  const value = control?.value;
  return Array.isArray(value) && value.includes(vulneraciones);
}





  agregarVulneraciones(): void {
  const id_afectado = this.vulneracionesForm.get('id_afectado')?.value;
  const vulneraciones = this.vulneracionesForm.get('vulneraciones')?.value;

  if (!id_afectado || !Array.isArray(vulneraciones)) {
    console.warn('Formulario incompleto');
    this.vulneracionesForm.markAllAsTouched();
    toast.error('vulneraciones no agregadas', {
              duration: 3000,
              description: 'Por Favor, Completa Todos los Campos Requeridos',
              // delete: true,
            });
    return;
  }

  this.formArray.push(this.fb.group({
    id_afectado: [id_afectado],
    vulneraciones: [vulneraciones]
  }));
  toast.success('Vulneraciones agregadas', {
          duration: 3000,
          description: 'Las vulneraciones se han agregado correctamente',
          // delete: true,
        });


  this.vulneracionesForm.reset();
  console.log(this.formArray.value)
}
eliminarRegistro(index: number) {
  this.formArray.removeAt(index);
}







}

