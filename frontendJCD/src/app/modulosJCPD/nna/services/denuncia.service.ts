import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Denuncia } from '@nna/interfaces/denuncia.interface';
import { environment } from 'environments/environment';



@Injectable({
  providedIn: 'root'
})
export class DenunciaService {
  private apiUrl = `${environment.CLIENT_URL}/api/denuncias`;

  constructor(private http: HttpClient) { }

  crearDenuncia(denuncia: Omit<Denuncia, 'id'>): Observable<{ success: boolean; message: string; data: { id: number } }> {
    return this.http.post<{ success: boolean; message: string; data: { id: number } }>(`${this.apiUrl}`, denuncia);
  }
  eliminarDenuncia(id:number ): Observable<any>{

    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  obtenerDenuncia(id: number): Observable<Denuncia> {
    return this.http.get<Denuncia>(`${this.apiUrl}/${id}`);
  }

 obtenerNumTramite(grupoPrioritario: string, incrementar: boolean = false): Observable<{ numero: number }> {
  return this.http.get<{ numero: number }>(
    `${this.apiUrl}/num_tramite`,
    {
      params: {
        grupoPrioritario,
        incrementar: incrementar.toString()
      }
    }
  );
}

   contarDenunciasActivas(grupoPrioritario: string): Observable<{ total: number }> {
  const params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

  return this.http.get<{ total: number }>(
    `${this.apiUrl}/countdenunciasActivas`,
    { params }
  );
}



  /**
   * Obtiene denuncias con paginación desde el backend.
   * Asume que el endpoint responde con un objeto { data: Denuncia[], total: number, page: number, limit: number }
   */
  obtenerDenunciasPaginadas( grupoPrioritario: string, page: number = 1, limit: number = 10): Observable<{ data: Denuncia[]; total: number; page: number; limit: number }> {
    let params = new HttpParams()

      .set('grupoPrioritario', grupoPrioritario)
      .set('page', String(page))
      .set('limit', String(limit));

    return this.http.get<{ data: Denuncia[]; total: number; page: number; limit: number }>(`${this.apiUrl}`, { params });
  }

   obtenerDenunciaEditMode(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/denuncia-completa/${id}`);
  }



  actualizarDenuncia(id: number, denuncia: Partial<Denuncia>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`, denuncia);
  }



  /**
   * Request PDF generation and return binary Blob (useful to trigger download)
   */
  crearpdfBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/crearpdf/${id}`, { responseType: 'blob' });
  }
}

