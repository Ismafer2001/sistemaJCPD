
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Response } from 'express';
import { obtenerCitacion } from '../citaciones.service';
import { RegistrarLoggs } from '../loggs.service';


// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

/**
 * Genera un PDF de denuncia usando pdfmake a partir de los datos en `data`.
 * Escribe el pdf directamente en `res` como attachment.
 */

export const PDFcitacion = async (res: Response, idCitacion: any, idUsuario:number,usuario:string,nombres:string,canton:string) => {
	try {
		const pdfData = await obtenerCitacion(idCitacion);

	const docDefinition: any = {
		content: [
			{ text: [{ text: 'CITACIÓN N° ' }, { text: pdfData.codigoTramite || '', bold: true }], style: 'title', alignment: 'center', margin: [0, 0, 0, 10] },
			{ text: 'CITACION', style: 'section', margin: [0, 10, 0, 10] },
			...(((pdfData.parte || '').toLowerCase() === 'representante institucional') ? [
				{ text: 'Señor:' },
				{ text: [{ text: pdfData.diriguidoA, bold: true }] },
				{ text: [{ text: `${pdfData.cargo || ''}, ${pdfData.institucion || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, ''), bold: true }] }
			] : [
				{ text: 'Señor:' },
				{ text: [{ text: pdfData.diriguidoA, bold: true }] },
				{ text: [{ text: 'PARTE ' }, { text: pdfData.parte || 'ACCIONADA', bold: true }] }
			]),
			{ text: 'Ciudad.' },
			{ text: 'De nuestras consideraciones:', decoration: 'underline', margin: [0, 10, 0, 10] },
			{ text: [{ text: 'Reciban un cordial saludo de quienes conformamos la Junta de Protección de Derechos de la ciudad de ' }, { text: pdfData.canton || '', bold: true }, { text: '.' }] },
			{ text: [{ text: 'Adjunto a la presente sírvase encontrar la Citación de fecha ' }, { text: pdfData.fecha ? new Date(pdfData.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+), (\d+) de (\w+) de (\d+)/, '$1 $2, de $3 del $4') : '', bold: true }, { text: ', para que asista a la Audiencia de Contestación a realizarse:' }] },
			{
				ul: [
					{ text: [{ text: 'LOCAL: ' }, { text: pdfData.local || '', bold: true }] },
					{ text: [{ text: 'DIRECCIÓN: ' }, { text: pdfData.direccion || '', bold: true }] },
					{ text: [{ text: 'HORA: ' }, { text: pdfData.hora || '', bold: true }] },
					{ text: [{ text: 'FECHA: ' }, { text: pdfData.fecha ? new Date(pdfData.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+), (\d+) de (\w+) de (\d+)/, '$1 $2, de $3 del $4') : '', bold: true }] }
				]
			},
			{ text: [{ text: 'Dispuesta dentro del trámite administrativo N° ' }, { text: pdfData.codigoTramite || '', bold: true }] },
			{ text: [{ text: 'RAZÓN: ' }, { text: pdfData.razon || '', bold: true }], margin: [0, 10, 0, 10] },
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
		 RegistrarLoggs({
							idUsuario: idUsuario,
							usuario:usuario ,
							nombres: nombres,
							fase:'citaciones',
							accion:'GENERATE' ,
							descripcion:` ${usuario} acaba de generar pdf de audiencia de pruebas con  codigo de expediente ${pdfData.codigoTramite}` ,
							canton:canton
							
						  });
	} catch (error) {
		 console.error('Error al generar el PDF de audiencia de prueba:', error);
    if (!res.headersSent) {
      res.status(500).send('Error al generar el PDF de audiencia de prueba');
    }
  }
		
	}
	

