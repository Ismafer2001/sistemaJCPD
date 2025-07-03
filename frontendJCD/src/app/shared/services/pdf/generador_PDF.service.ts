import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { MedidasService } from '@nna/services/medidas.service';
import { VulneracionService } from '@nna/services/vulneracion.service';

interface Denunciante {
  cedula: number;
  nombres: string;
  apellidos: string;
  edad: number;
  genero: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
}

interface Afectado {
  cedula: number;
  nombre: string;
  apellido: string;
  sexo: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
}

interface Denunciado {
  cedula: number;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  nacionalidad: string;
  direccion: string;
  mail: string;
  telefono: string;
  parentezco: string;
}

interface DenunciaData {
  tramite: string;
  num_tramite: number;
  denunciante: Denunciante;
  afectados: Afectado[];
  denunciados: Denunciado[];
  descripcion_hechos: string;
  vulneraciones: {
    ids: number[];
  };
  medidas: {
    ids: number[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class Generador_PDFService {

  constructor(
    private medidasService: MedidasService,
    private vulneracionService: VulneracionService
  ) { }

  async generarPDFDenuncia(datos: DenunciaData) {
    console.log('Datos recibidos en el servicio PDF:', datos);
    console.log('Medidas recibidas:', datos.medidas);
    
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPos = margin;
    
    // Función para agregar nueva página si es necesario
    const checkNewPage = (requiredSpace: number): boolean => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };
    
    // Configuración inicial
    doc.setFontSize(16);
    doc.text('DENUNCIA JCPD', 105, yPos, { align: 'center' });
    yPos += 20;
    
    // Número de Trámite
    doc.setFontSize(12);
    doc.text(`Número de Trámite: ${datos.tramite}`, margin, yPos);
    yPos += 15;
    
    // Datos del Denunciante
    doc.setFontSize(14);
    doc.text('DATOS DEL DENUNCIANTE', margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    const denuncianteData: string[] = [
      `Cédula: ${datos.denunciante.cedula}`,
      `Nombres: ${datos.denunciante.nombres}`,
      `Apellidos: ${datos.denunciante.apellidos}`,
      `Edad: ${datos.denunciante.edad}`,
      `Género: ${datos.denunciante.genero}`,
      `Nacionalidad: ${datos.denunciante.nacionalidad}`,
      `Dirección: ${datos.denunciante.direccion}`,
      `Correo: ${datos.denunciante.mail}`,
      `Teléfono: ${datos.denunciante.telefono}`
    ];
    
    denuncianteData.forEach((line: string) => {
      checkNewPage(5);
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    
    // Datos de los Afectados
    checkNewPage(20);
    doc.setFontSize(14);
    doc.text('DATOS DE LOS AFECTADOS', margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    datos.afectados.forEach((afectado: Afectado, index: number) => {
      const afectadoData: string[] = [
        `Afectado ${index + 1}:`,
        `Cédula: ${afectado.cedula}`,
        `Nombre: ${afectado.nombre}`,
        `Apellido: ${afectado.apellido}`,
        `Sexo: ${afectado.sexo}`,
        `Nacionalidad: ${afectado.nacionalidad}`,
        `Dirección: ${afectado.direccion}`,
        `Correo: ${afectado.mail}`,
        `Teléfono: ${afectado.telefono}`
      ];
      
      afectadoData.forEach((line: string) => {
        checkNewPage(5);
        doc.text(line, margin + (line.startsWith('Afectado') ? 0 : 5), yPos);
        yPos += 5;
      });
      yPos += 5;
    });
    
    // Datos de los Denunciados
    checkNewPage(20);
    doc.setFontSize(14);
    doc.text('DATOS DE LOS DENUNCIADOS', margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    datos.denunciados.forEach((denunciado: Denunciado, index: number) => {
      const denunciadoData: string[] = [
        `Denunciado ${index + 1}:`,
        `Cédula: ${denunciado.cedula}`,
        `Nombres: ${denunciado.nombres}`,
        `Apellidos: ${denunciado.apellidos}`,
        `Edad: ${denunciado.edad}`,
        `Sexo: ${denunciado.sexo}`,
        `Nacionalidad: ${denunciado.nacionalidad}`,
        `Dirección: ${denunciado.direccion}`,
        `Correo: ${denunciado.mail}`,
        `Teléfono: ${denunciado.telefono}`,
        `Parentesco: ${denunciado.parentezco}`
      ];
      
      denunciadoData.forEach((line: string) => {
        checkNewPage(5);
        doc.text(line, margin + (line.startsWith('Denunciado') ? 0 : 5), yPos);
        yPos += 5;
      });
      yPos += 5;
    });
    
    // Descripción de Hechos
    checkNewPage(20);
    doc.setFontSize(14);
    doc.text('DESCRIPCIÓN DE HECHOS', margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    const descripcionLines: string[] = doc.splitTextToSize(datos.descripcion_hechos, 170);
    descripcionLines.forEach((line: string) => {
      checkNewPage(5);
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    
    // Vulneraciones
    checkNewPage(20);
    doc.setFontSize(14);
    doc.text('VULNERACIONES', margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    try {
      console.log('Obteniendo vulneraciones del servicio...');
      const vulneraciones = await this.vulneracionService.getVulneraciones().toPromise();
      console.log('Vulneraciones obtenidas:', vulneraciones);
      console.log('Vulneraciones seleccionadas:', datos.vulneraciones.ids);
      
      if (vulneraciones) {
        const vulneracionesMap = new Map<number, string>();
        vulneraciones.forEach((vulneracion) => {
          console.log('Agregando vulneración al mapa:', vulneracion.id, vulneracion.vulneracion);
          vulneracionesMap.set(vulneracion.id, vulneracion.vulneracion);
        });
        
        console.log('Mapa de vulneraciones creado:', vulneracionesMap);
        
        if (Array.isArray(datos.vulneraciones.ids)) {
          datos.vulneraciones.ids.forEach((vulneracionId: number) => {
            console.log('Buscando vulneración con ID:', vulneracionId);
            const descripcion = vulneracionesMap.get(vulneracionId);
            console.log('Descripción encontrada:', descripcion);
            if (descripcion) {
              checkNewPage(5);
              doc.text(`• ${descripcion}`, margin + 5, yPos);
              yPos += 5;
            } else {
              console.warn('No se encontró descripción para la vulneración:', vulneracionId);
            }
          });
        } else {
          console.warn('datos.vulneraciones.ids no es un array:', datos.vulneraciones.ids);
        }
      } else {
        console.error('No se obtuvieron vulneraciones del servicio');
      }
    } catch (error) {
      console.error('Error al obtener las vulneraciones:', error);
    }
    
    // Medidas
    checkNewPage(20);
    doc.setFontSize(14);
    doc.text('MEDIDAS DE PROTECCIÓN', margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    try {
      console.log('Obteniendo medidas del servicio...');
      const response = await this.medidasService.getAllMedidas().toPromise();
      console.log('Respuesta del servicio de medidas:', response);
      
      if (response && response.success) {
        const todasLasMedidas = response.data;
        console.log('Todas las medidas:', todasLasMedidas);
        console.log('Medidas seleccionadas:', datos.medidas.ids);
        
        const medidasMap = new Map<number, string>();
        todasLasMedidas.forEach((articulo: any) => {
          console.log('Procesando artículo:', articulo);
          articulo.medidas.forEach((medida: any) => {
            console.log('Agregando medida al mapa:', medida.id, medida.medida);
            medidasMap.set(medida.id, medida.medida);
          });
        });
        
        console.log('Mapa de medidas creado:', medidasMap);
        
        if (Array.isArray(datos.medidas.ids)) {
          datos.medidas.ids.forEach((medidaId: number) => {
            console.log('Buscando medida con ID:', medidaId);
            const descripcion = medidasMap.get(medidaId);
            console.log('Descripción encontrada:', descripcion);
            if (descripcion) {
              checkNewPage(5);
              doc.text(`• ${descripcion}`, margin + 5, yPos);
              yPos += 5;
            } else {
              console.warn('No se encontró descripción para la medida:', medidaId);
            }
          });
        } else {
          console.warn('datos.medidas.ids no es un array:', datos.medidas.ids);
        }
      } else {
        console.error('Error en la respuesta del servicio de medidas:', response);
      }
    } catch (error) {
      console.error('Error al obtener las medidas:', error);
    }
    
    // Guardar el PDF
    doc.save(`denuncia-${datos.tramite}.pdf`);
  }
}
