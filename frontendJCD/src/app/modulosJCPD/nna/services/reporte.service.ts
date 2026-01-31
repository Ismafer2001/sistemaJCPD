import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
private apiUrl = `${environment.CLIENT_URL}/api/reportes`; // adaptalo si tenés prefijo

  constructor(private http: HttpClient) {}

  //------------------REPORTES DENUNCIA---------------//

  obtenerResumen(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/denunciastotales`, { params });
  }

  //------------------REPORTES AVOCATORIA---------------//
  getReporteVocatoria(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/avocatoriasreporte`, { params });
  }
   getReporteAvocatoriaMedidas(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/avocatoriasreporte/medidasagrupadasporarticulo`, { params });
  }
   getReporteAvocatoriavulneraciones(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/avocatoriasreporte/vulneracionesagrupadas`, { params });
  }


  //------------------REPORTES NOTIFICACIONES---------------//
  getReporteNotificaciones(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/notificacionestotales`, { params });
  }
  //------------------REPORTES CITACIONES---------------//
  getReporteCitaciones(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/citacionestotales`, { params });
  }

  //------------------REPORTES AUDIENCIA CONTESTACION ---------------//
  getReporteAudienciaContestacion(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/audienciascontestaciontotales`, { params });
  }

  //------------------REPORTES AUDIENCIA PRUEBAS ---------------//
  getReporteAudienciaPruebas(grupoPrioritario: string, desde?: string, hasta?: string): Observable<any> {
    let params = new HttpParams().set('grupoPrioritario', grupoPrioritario);

    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get(`${this.apiUrl}/audienciaspruebastotales`, { params });
  }
}
