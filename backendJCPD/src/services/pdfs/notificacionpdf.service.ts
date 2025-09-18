
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Response } from 'express';
import { obtenerDatosNotificacion } from '../notificaciones.service';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

/**
 * Genera un PDF de denuncia usando pdfmake a partir de los datos en `data`.
 * Escribe el pdf directamente en `res` como attachment.
 */


export const PDFnotificacion = async (res: Response,idNotificacion: any) => {

  const pdfData = await obtenerDatosNotificacion(idNotificacion);

  const contentBlocks: any[] = [
    { text: 'FORMATO DE NOTIFICACION', style: 'title', alignment: 'center', margin: [0, 0, 0, 10] },
    { text: `Trámite Administrativo N° ${pdfData.codigoTramite}` },
    { text: `${pdfData.fechaAvocatoria}` },
    { text: `Oficio N° 00000` },
    { text: 'NOTIFICACIÓN', style: 'section', margin: [0, 10, 0, 10] },
  ];

  if ((pdfData.parte || '').toLowerCase() === 'institucion') {
    contentBlocks.push({ text: pdfData.diriguidoA });
  } else {
    contentBlocks.push({ text: 'Señor/Señora' });
    contentBlocks.push({ text: pdfData.diriguidoA });
    contentBlocks.push({ text: `PARTE ${pdfData.parte}` });
  }
  
  contentBlocks.push({ text: 'Ciudad.' });
  contentBlocks.push({ text: `${pdfData.canton}` });
  contentBlocks.push({ text: 'De nuestras consideraciones:', decoration: 'underline', margin: [0, 10, 0, 10] });
  contentBlocks.push({ text: `Reciban un cordial saludo de quienes conformamos la Junta de Protección del cantón ${pdfData.canton || ''}.` });
  contentBlocks.push({ text: `Adjunto a la presente sírvase encontrar la Avocatoria de fecha ${pdfData.fechaAvocatoria}, en donde encontrará las medidas de protección dispuestas a su favor dentro del trámite administrativo N° ${pdfData.codigoTramite}.` });
  contentBlocks.push({ text: 'Sin otro particular suscribimos.' });
  contentBlocks.push({ text: 'Atentamente,' });
  contentBlocks.push({ text: 'MIEMBROS DE LA JUNTA CANTONAL DE PROTECCION DE DERECHOS', style: 'section', margin: [0, 10, 0, 10] });
  contentBlocks.push({ text: 'RECIBIDO: ____________________________________________' });
  contentBlocks.push({ text: 'FECHA: _______________' });
  contentBlocks.push({ text: 'DIRECCIÓN: ____________________________________________' });
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
};
