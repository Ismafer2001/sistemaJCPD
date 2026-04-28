import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AudienciaPruebasService {
 private apiUrl = `${environment.CLIENT_URL}/api/audiencia-pruebas`;
  constructor(private http: HttpClient) { }

   getParticipantesAudiencia(idDenuncia: number) {
    // Ajusta la URL según tu backend
    return this.http.get<any>(`${this.apiUrl}/participantes-audiencia-prueba/${idDenuncia}`);
  }

  postCrearParticipante(participante: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/agregar-participante`, participante);
  }

  getDatosAudiencia(idDenuncia: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/datos-audiencia-prueba/${idDenuncia}`);
  }

   postaudienciaPrueba(audienciaPrueba: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, audienciaPrueba);
  }


  descargarArchivoSeguro(codigoTramite: string, nombreArchivo: string) {
  const url = `${this.apiUrl}/files/${codigoTramite}/pruebas/${nombreArchivo}`;

  // Usamos responseType: 'blob' para recibir el archivo binario
  return this.http.get(url, { responseType: 'blob' });
}

  // Método para enviar FormData con archivos (patrón anexar_seguimiento)
  postAudienciaPruebasConArchivos(formData: FormData, codigoTramite: string, tipoCarpeta: string): Observable<any> {
    const params = new HttpParams()
      .set('codigoTramite', codigoTramite)
      .set('tipoCarpeta', tipoCarpeta);

    return this.http.post(`${this.apiUrl}/con-archivos`, formData, { params });
  }


  getVulneracionesIdentificadas(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vulneraciones/${id}`);
  }
  agregarVulneracionIdentificada(vulneracion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vulneracion-identificada`, vulneracion);
  }
  eliminarVulneracionIdentificada(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/vulneracion-identificada/${id}`);
  }
  actualizarVulneracionIdentificada(id: number, vulneracion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vulneracion-identificada/${id}`, vulneracion);
  }

   getAudienciaPruebaEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/datosaudienciapruebacompleta/${id}`);
  }

  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
  }
  actualizarAudienciaPrueba(id: number, audienciaPrueba: Partial<any>, codigoTramite: string, tipoCarpeta: string): Observable<{ success: boolean; message: string }> {
       const params = new HttpParams()
      .set('codigoTramite', codigoTramite)
      .set('tipoCarpeta', tipoCarpeta);
    return this.http.put<any>(`${this.apiUrl}/con-archivos/${id}`, audienciaPrueba,{ params });
    }


}
