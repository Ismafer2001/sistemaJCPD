
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Response } from 'express';
import { obtenerCitacion } from '../citaciones.service';


// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

/**
 * Genera un PDF de denuncia usando pdfmake a partir de los datos en `data`.
 * Escribe el pdf directamente en `res` como attachment.
 */

export const PDFcitacion = async (res: Response, idCitacion: any) => {
	const pdfData = await obtenerCitacion(idCitacion);

	const docDefinition: any = {
		content: [
			{ text: 'FORMATO DE CITACIÓN', style: 'title', alignment: 'center', margin: [0, 0, 0, 10] },
			{ text: 'CITACION', style: 'section', margin: [0, 10, 0, 10] },
			{ text: 'Señor:' },
			{ text: pdfData.diriguidoA },
			{ text: `PARTE ${pdfData.parte || 'ACCIONADA'}` },
			{ text: 'Ciudad.' },
			{ text: 'De nuestras consideraciones:', decoration: 'underline', margin: [0, 10, 0, 10] },
			{ text: 'Reciban un cordial saludo de quienes conformamos la Junta de Protección de Derechos de la ciudad de …………………...' },
			{ text: `Adjunto a la presente sírvase encontrar la Citación de fecha ${pdfData.fecha || 'XXXX'} del …………….de ………., para que asista a la Audiencia de Contestación a realizarse:` },
			{ text: `LOCAL: ${pdfData.local || ''}` },
			{ text: `DIRECCIÓN: ${pdfData.direccion || ''}` },
			{ text: `HORA: ${pdfData.hora || ''}` },
			{ text: `FECHA: ${pdfData.fecha || ''}` },
			{ text: `Dispuesta dentro del trámite administrativo N° ${pdfData.codigoTramite || '0XXXXX-JCPD-…..-……………..'}` },
			{ text: 'Sin otro particular suscribimos.' },
			{ text: 'Atentamente,' },
			{ text: 'MIEMBROS DE LA JUNTA CANTONAL DE PROTECCION DE DERECHOS', style: 'section', margin: [0, 10, 0, 10] },
			{ text: 'RECIBIDO……………………………………………………………………………...…………………' },
			{ text: 'FECHA………………' }
		],
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
			res.setHeader('Content-Disposition', 'attachment; filename=citacion.pdf');
		}
		res.send(Buffer.from(buffer));
	});
}
