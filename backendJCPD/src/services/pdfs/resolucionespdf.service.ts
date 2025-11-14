
import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { obtenerResolucionCompleta } from '../resoluciones.service';
import htmlToPdfmake from "html-to-pdfmake";
import { JSDOM } from "jsdom";

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export async function crearPdfResolucionNNA(res: Response, idResolucion: any): Promise<void> {
  const dom = new JSDOM("");
  try {
    const pdfData = await obtenerResolucionCompleta(idResolucion);

    const docDefinition = {
      content: [
        {
          text: [
            { text: 'RESOLUCIÓN ', bold: true, fontSize: 18 },
            { text: pdfData.codigoTramite || '', bold: true, fontSize: 18 }
          ],
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: 'CONSIDERACIONES',
          bold: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        ...(pdfData.consideraciones
          ? htmlToPdfmake(pdfData.consideraciones, dom.window).map((block: any) => ({ ...block, margin: [0, 0, 0, 20] }))
          : [{ text: '(Sin consideraciones registradas)', margin: [0, 0, 0, 20] }]),
        {
          text: 'RESOLUCIONES',
          bold: true,
          fontSize: 14,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        ...(pdfData.resolucion
          ? htmlToPdfmake(pdfData.resolucion, dom.window).map((block: any) => ({ ...block, margin: [0, 0, 0, 20] }))
          : [{ text: '(Sin resoluciones registradas)', margin: [0, 0, 0, 20] }]),
        ...((pdfData.medidasDefinitivas || []).flatMap((afectado: any) => [
        // Solo tablas de medidas aquí, sin firmas
  // Sección de firmas al final, después de todas las medidas
          {
            text: `Afectado: ${(afectado.nombres || '') + ' ' + (afectado.apellidos || '')}`.trim(),
            bold: true,
            margin: [0, 10, 0, 5]
          },
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { text: 'MEDIDA', bold: true, fillColor: '#eeeeee' },
                  { text: 'PERIODO', bold: true, fillColor: '#eeeeee' },
                  { text: 'OBSERVACIÓN', bold: true, fillColor: '#eeeeee' }
                ],
                ...((afectado.medidas || []).map((m: any) => [
  // ...existing code...
                  m.medida || '',
                  m.periodo || '',
                  m.observaciones || ''
                ]))
              ]
            },
            layout: 'box',
            margin: [0, 0, 0, 20]
          }
        ])),
      ]
    };

    // @ts-ignore
    const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
    pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=audiencia_prueba.pdf');
      }
      res.send(Buffer.from(buffer));
    });
  } catch (error) {
    console.error('Error al generar el PDF de resolución:', error);
    if (!res.headersSent) {
      res.status(500).send('Error al generar el PDF de resolución');
    }
  }
}