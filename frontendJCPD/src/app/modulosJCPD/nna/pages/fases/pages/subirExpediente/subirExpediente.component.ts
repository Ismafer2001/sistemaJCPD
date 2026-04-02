
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
import { SubirExpedientesService } from '@nna/services/subirExpedientes.service';
import { TablaEditComponent } from '@shared/components/tabla/tablaEdit/tablaEdit.component';
import { CommonModule } from '@angular/common';
import { InhibirseService } from '@nna/services/inhibirse.service';
import ButtonSubmitComponent from '@shared/components/button-submit/button-submit.component';

@Component({
  selector: 'app-subirExpediente',
  templateUrl: './subirExpediente.component.html',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, TablaEditComponent, ButtonSubmitComponent]

})
export class SubirExpedienteComponent implements OnInit {
      editMode: boolean = false;
      expedienteEditId: number | null = null;


    loading: boolean = false;
    loadingMessage: string = '';
  denunciaId: number = 0;
  grupo: string = '';
  expedienteForm!: FormGroup;
  selectedFile: File | null = null;
  uploadSuccess: boolean = false;
  uploadError: string = '';
   expedientes: any[] = [];
  isLoadingExpedientes: boolean = false;
  codigoTramite: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private subirExpedientesService: SubirExpedientesService,
    private inhibirseService: InhibirseService
  ) { }

  ngOnInit() {
    const grupo = this.route.parent?.snapshot.paramMap.get('grupo');
    this.grupo = grupo === 'nna' ? 'nna' : 'adultos';
    this.route.params.subscribe(params => {
      this.denunciaId = +params['id'];
      // Inicializar el formulario con el idDenuncia
      this.expedienteForm = this.fb.group({
        idDenuncia: [this.denunciaId, Validators.required],
        tipoExpediente: ['', Validators.required],
        id:[]
      });
      this.cargarExpedientes();
      this.getcodigoTramite();
     this.expedienteForm.valueChanges.subscribe((n)=>{
          console.log(n)

        })

    });
  }
    descargarArchivo(exp: any) {
    const codigoTramite = this.codigoTramite;
    const tipoCarpeta = exp.tipoExpediente;
    const nombreArchivo = exp.filename;
    this.subirExpedientesService.descargarArchivoSeguro(codigoTramite, nombreArchivo, tipoCarpeta).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
   editarExpediente(expediente: any) {
        this.editMode = true;
        this.expedienteEditId = expediente.id;
        console.log(this.expedienteEditId)
        this.expedienteForm.patchValue({
          tipoExpediente: expediente.tipoExpediente,
          idDenuncia: this.denunciaId,
          id: expediente.id
        });

        this.selectedFile = null;
      }

  cargarExpedientes() {
    this.isLoadingExpedientes = true;
    this.subirExpedientesService.getArchivos(this.denunciaId).subscribe({
      next: (res: any) => {
        console.log('Expedientes obtenidos:', res);
        this.expedientes = Array.isArray(res) ? res : [];
        this.isLoadingExpedientes = false;
      },
      error: () => {
        this.expedientes = [];
        this.isLoadingExpedientes = false;
      }
    });
  }
  getcodigoTramite() {
    this.inhibirseService.getCodigoTramite(this.denunciaId).subscribe(data=>{
      this.codigoTramite = data.codigoTramite;
      console.log(this.codigoTramite)

    })

  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
    console.log(this.selectedFile)
  }



  onSubmit() {
    if (this.expedienteForm.invalid || (!this.selectedFile && !this.editMode)) {
      return;
    }
    this.loading = true;
    this.loadingMessage = this.editMode ? 'Actualizando expediente...' : 'Subiendo expediente...';
    const formData = new FormData();
    formData.append('idDenuncia', this.expedienteForm.get('idDenuncia')?.value);
    formData.append('tipoExpediente', this.expedienteForm.get('tipoExpediente')?.value);
    formData.append('codigoTramite', this.codigoTramite);

    if (this.selectedFile) {
      formData.append('archivo', this.selectedFile);
    }

    this.uploadSuccess = false;
    this.uploadError = '';

    const codigoTramite = this.codigoTramite;
    const tipoCarpeta = this.expedienteForm.get('tipoExpediente')?.value || '';

    if (this.editMode && this.expedienteEditId) {
      this.subirExpedientesService.updateArchivo(formData, codigoTramite, tipoCarpeta, this.expedienteEditId).subscribe({
        next: (res: any) => {
          this.uploadSuccess = true;
          this.uploadError = '';
          this.selectedFile = null;
          this.expedienteForm.get('tipoExpediente')?.reset();
          this.cargarExpedientes();
          this.loading = false;
          this.loadingMessage = '';
          this.editMode = false;
          this.expedienteEditId = null;
        },
        error: (err: any) => {
          this.uploadSuccess = false;
          this.uploadError = err?.error?.message || 'Error al actualizar expediente';
          this.loading = false;
          this.loadingMessage = '';
        }
      });
    } else {
      this.subirExpedientesService.uploadArchivo(formData, codigoTramite, tipoCarpeta).subscribe({
        next: (res: any) => {
          this.uploadSuccess = true;
          this.uploadError = '';
          this.selectedFile = null;
          this.expedienteForm.get('tipoExpediente')?.reset();
          this.cargarExpedientes();
          this.loading = false;
          this.loadingMessage = '';
        },
        error: (err: any) => {
          this.uploadSuccess = false;
          this.uploadError = err?.error?.message || 'Error al subir expediente';
          this.loading = false;
          this.loadingMessage = '';
        }
      });
    }
  }



}

export default SubirExpedienteComponent;
