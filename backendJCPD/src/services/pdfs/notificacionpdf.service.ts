
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Response } from 'express';
import { obtenerDatosNotificacion } from '../notificaciones.service';
import { RegistrarLoggs } from '../loggs.service';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

/**
 * Genera un PDF de denuncia usando pdfmake a partir de los datos en `data`.
 * Escribe el pdf directamente en `res` como attachment.
 */


export const PDFnotificacion = async (res: Response,idNotificacion: any, idUsuario:number,usuario:string,nombres:string,canton:string) => {

  try {
      const pdfData = await obtenerDatosNotificacion(idNotificacion);

  const contentBlocks: any[] = [
    { text: 'FORMATO DE NOTIFICACION', style: 'title', alignment: 'center', margin: [0, 0, 0, 10] },
    { text: [{ text: 'Trámite Administrativo N° ' }, { text: pdfData.codigoTramite, bold: true }] },
    { text: [{ text: pdfData.fechaCreado ? new Date(pdfData.fechaCreado).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+), (\d+) de (\w+) de (\d+)/, '$1 $2, de $3 del $4') : '', bold: true }] },
    { text: [{ text: 'Oficio N° ' }, { text: pdfData.numOficio, bold: true }] },
    { text: 'NOTIFICACIÓN', style: 'section', margin: [0, 10, 0, 10] },
  ];

  if ((pdfData.parte || '').toLowerCase() === 'representante institucional') {
    contentBlocks.push({ text: [{ text: pdfData.diriguidoA, bold: true }] });
    contentBlocks.push({ text: [{ text: `${pdfData.cargo || ''} ${pdfData.institucion || ''}`.trim(), bold: true }] });
  } else {
    contentBlocks.push({ text: 'Señor/Señora' });
    contentBlocks.push({ text: [{ text: pdfData.diriguidoA, bold: true }] });
    contentBlocks.push({ text: [{ text: 'PARTE ' }, { text: pdfData.parte, bold: true }] });
  }
  
  contentBlocks.push({ text: 'Ciudad.' });
  contentBlocks.push({ text: [{ text: pdfData.canton, bold: true }] });
  contentBlocks.push({ text: 'De nuestras consideraciones:', decoration: 'underline', margin: [0, 10, 0, 10] });
  contentBlocks.push({ text: [{ text: 'Reciban un cordial saludo de quienes conformamos la Junta de Protección del cantón ' }, { text: pdfData.canton || '', bold: true }, { text: '.' }] });
  contentBlocks.push({ text: [{ text: 'Adjunto a la presente sírvase encontrar la Avocatoria de fecha ' }, { text: pdfData.fechaAvocatoria ? new Date(pdfData.fechaAvocatoria).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+), (\d+) de (\w+) de (\d+)/, '$1 $2, de $3 del $4') : '', bold: true }, { text: ', en donde encontrará las medidas de protección dispuestas a su favor dentro del trámite administrativo N° ' }, { text: pdfData.codigoTramite, bold: true }, { text: '.' }] });
  contentBlocks.push({ text: 'Sin otro particular suscribimos.' });
  contentBlocks.push({ text: 'Atentamente,' });
  contentBlocks.push({ text: 'MIEMBROS DE LA JUNTA CANTONAL DE PROTECCION DE DERECHOS', style: 'section', margin: [0, 10, 0, 10] });
  contentBlocks.push({ text: 'RECIBIDO: ____________________________________________' });
  contentBlocks.push({ text: 'FECHA: _______________' });
  contentBlocks.push({ text: [{ text: 'DIRECCIÓN:' }, { text: pdfData.direccion || '', bold: true }] });
  contentBlocks.push({ text: 'NOTA: Se adjunta Avocatoria de Conocimiento, medidas de protección y boleta de auxilio', margin: [0, 10, 0, 0] });

  const docDefinition: any = {
    content: contentBlocks,
    styles: {
      title: { fontSize: 14, bold: true },
      section: { fontSize: 12, bold: true }
    },
    defaultStyle: { fontSize: 11 }
  };

  // @ts-ignore
  const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
  pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=notificacion.pdf');
    }
    res.send(Buffer.from(buffer));
  });
    RegistrarLoggs({
                  idUsuario: idUsuario,
                  usuario:usuario ,
                  nombres: nombres,
                  fase:'notificacion',
                  accion:'GENERATE' ,
                  descripcion:` ${usuario} acaba de generar pdf de audiencia de pruebas con  codigo de expediente ${pdfData.codigoTramite}` ,
                  canton:canton
                  
                  });
    
  } catch (error) {
      console.error('Error al generar el PDF de notificacion:', error);
    if (!res.headersSent) {
      res.status(500).send('Error al generar el PDF de notificacion');
    }
  }
    
  }



