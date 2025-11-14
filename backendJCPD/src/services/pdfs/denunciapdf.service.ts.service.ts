import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { getDenunciaCompleta } from '../denuncia.service';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

/**
 * Genera un PDF de denuncia usando pdfmake a partir de los datos en `data`.
 * Escribe el pdf directamente en `res` como attachment.
 */

export async function crearPdfDenunciaNNA(res: Response, idDenuncia: any): Promise<void> {
	try { 

		const pdfData = await getDenunciaCompleta(idDenuncia);

		const now = new Date();
		// Bloques de denunciante
		const denunciante = pdfData.denunciantes && pdfData.denunciantes.length ? pdfData.denunciantes[0] : {};
		const denuncianteBlock = {
			table: {
				widths: ['30%', '70%'],
				body: [
					[{ text: 'Nombres', bold: true, fontSize: 12 },{ text: `${denunciante?.nombres  || ''}`, fontSize: 12 }],
					[{ text: 'Apellidos', bold: true, fontSize: 12 },{ text: `${denunciante?.apellidos || ''}`, fontSize: 12 }],
					[{ text: 'Edad', bold: true, fontSize: 12 },{ text: `${denunciante?.edad || ''}`, fontSize: 12 }],
					[{ text: 'Sexo', bold: true, fontSize: 12 },{ text: `${denunciante?.sexo || ''}`, fontSize: 12 }],
					[{ text: 'Dirección', bold: true, fontSize: 12 },{ text: `${denunciante?.direccion || ''}`, fontSize: 12 }],
					[{ text: 'Teléfono / Mail', bold: true, fontSize: 12 },{ text: `${denunciante?.telefono || ''} / ${denunciante?.mail || ''}`, fontSize: 12 }]
				]
			},
			margin: [0, 4, 0, 8]
		};

		// Bloques de afectados
		const afectadosArray = Array.isArray(pdfData.afectados) ? pdfData.afectados : [];
		const afectadosBlocks: any[] = [];
		if (afectadosArray.length) {
			for (let i = 0; i < afectadosArray.length; i++) {
				const a = afectadosArray[i];
				afectadosBlocks.push({ text: `Afectado ${i + 1}`, style: 'subLabel', margin: [0, 6, 0, 2] });
				afectadosBlocks.push({
					table: {
						widths: ['30%', '70%'],
						body: [
							[{ text: 'Nombres', bold: true, fontSize: 12 }, { text: a?.nombres || '', fontSize: 12 }],
							[{ text: 'Apellidos', bold: true, fontSize: 12 }, { text: a?.apellidos || '', fontSize: 12 }],
							[{ text: 'Edad', bold: true, fontSize: 12 }, { text: a?.edad || '', fontSize: 12 }],
							[{ text: 'Sexo', bold: true, fontSize: 12 }, { text: a?.sexo || '', fontSize: 12 }],
							[{ text: 'Cédula', bold: true, fontSize: 12 }, { text: a?.cedula || '', fontSize: 12 }]
						]
					},
					margin: [0, 4, 0, 8]
				});
			}
		} else {
			afectadosBlocks.push({ text: '(No especificado)', margin: [0, 4, 0, 8] });
		}

		// Bloques de denunciados
		const denunciadosArray = Array.isArray(pdfData.denunciados) ? pdfData.denunciados : [];
		const denunciadosBlocks: any[] = [];
		if (denunciadosArray.length) {
			for (let i = 0; i < denunciadosArray.length; i++) {
				const d = denunciadosArray[i];
				denunciadosBlocks.push({ text: `Denunciado ${i + 1}`, style: 'subLabel', margin: [0, 6, 0, 2] });
				denunciadosBlocks.push({
					table: {
						widths: ['30%', '70%'],
						body: [
							[{ text: 'Nombres', bold: true, fontSize: 12 }, { text: d?.nombres || '', fontSize: 12 }],
							[{ text: 'Apellidos', bold: true, fontSize: 12 }, { text: d?.apellidos || '', fontSize: 12 }],
							[{ text: 'Edad', bold: true, fontSize: 12 }, { text: d?.edad || '', fontSize: 12 }],
							[{ text: 'Sexo', bold: true, fontSize: 12 }, { text: d?.sexo || '', fontSize: 12 }],
							[{ text: 'Dirección', bold: true, fontSize: 12 }, { text: d?.direccion || '', fontSize: 12 }]
						]
					},
					margin: [0, 4, 0, 8]
				});
			}
		} else {
			denunciadosBlocks.push({ text: '(No especificado)', margin: [0, 4, 0, 8] });
		}

		// Bloque sobre los hechos
		const sobreHechosBlock = [
			{ text: 'Sobre el hecho', style: 'section' },
			{ text: pdfData?.denuncia?.descripcion_hechos || '(Sin descripción proporcionada)', margin: [0, 0, 0, 10] }
		];


		// Vulneraciones por afectado
		const vulneracionesBlocks: any[] = [];
		if (Array.isArray(pdfData.vulneraciones) && pdfData.vulneraciones.length) {
			for (const v of pdfData.vulneraciones) {
				vulneracionesBlocks.push({ text: `Vulneraciones de ${v.nombre} (ID: ${v.id})`, style: 'subLabel', margin: [0, 6, 0, 2] });
				const tableBody: any[] = [];
				// Encabezado
				tableBody.push([
					{ text: 'N°', bold: true, fillColor: '#eeeeee' },
					{ text: 'Vulneración', bold: true, fillColor: '#eeeeee' }
				]);
				// Filas de datos
				if (Array.isArray(v.vulneraciones) && v.vulneraciones.length) {
					let num = 1;
					for (const desc of v.vulneraciones) {
						tableBody.push([
							{ text: String(num), fontSize: 11 },
							{ text: String(desc), fontSize: 11 }
						]);
						num++;
					}
				} else {
					tableBody.push([
						{ text: '-', fontSize: 11 },
						{ text: '(No especificado)', fontSize: 11 }
					]);
				}
				vulneracionesBlocks.push({
					table: {
						widths: ['10%', '90%'],
						body: tableBody
					},
					margin: [0, 4, 0, 8]
				});
			}
		} else {
			vulneracionesBlocks.push({ text: '(No hay vulneraciones registradas)', margin: [0, 4, 0, 8] });
		}

		// Solicitud
		const solicitudBlock = [
			{ text: 'Solicitud', style: 'section' },
			{ text: pdfData?.denuncia?.solicitud || '(Sin solicitud proporcionada)', margin: [0, 0, 0, 10] }
		];

		// Medidas por afectado
		const medidasBlocks: any[] = [];
		if (Array.isArray(pdfData.medidas) && pdfData.medidas.length) {
			for (const m of pdfData.medidas) {
				medidasBlocks.push({ text: `Medidas de protección de ${m.nombre} (ID: ${m.id})`, style: 'subLabel', margin: [0, 6, 0, 2] });
				const tableBody: any[] = [];
				// Encabezado
				tableBody.push([
					{ text: 'N°', bold: true, fillColor: '#eeeeee' },
					{ text: 'Medida de protección', bold: true, fillColor: '#eeeeee' }
				]);
				// Filas de datos
				if (Array.isArray(m.medidas) && m.medidas.length) {
					let num = 1;
					for (const desc of m.medidas) {
						tableBody.push([
							{ text: String(num), fontSize: 11 },
							{ text: String(desc), fontSize: 11 }
						]);
						num++;
					}
				} else {
					tableBody.push([
						{ text: '-', fontSize: 11 },
						{ text: '(No especificado)', fontSize: 11 }
					]);
				}
				medidasBlocks.push({
					table: {
						widths: ['10%', '90%'],
						body: tableBody
					},
					margin: [0, 4, 0, 8]
				});
			}
		} else {
			medidasBlocks.push({ text: '(No hay medidas registradas)', margin: [0, 4, 0, 8] });
		}

		// Firma del denunciante
		const firmaBlock = [
			{ text: '\n\nFirma del denunciante:', margin: [0, 20, 0, 0] },
			{ text: `Nombres y apellidos: ${denunciante?.nombres || ''} ${denunciante?.apellidos || ''}`, margin: [0, 2, 0, 0] },
			{ text: `Cédula: ${denunciante?.cedula || ''}`, margin: [0, 2, 0, 0] }
		];

		const docDefinition: any = {
			info: {
				title: 'Denuncia',
				author: 'JCPD',
				creationDate: now
			},
			content: [
				{ text: 'FORMULARIO DE DENUNCIA', style: 'title', alignment: 'center' },
				{ text: '\n' },
				{ text: '1. DATOS DEL/LA DENUNCIANTE', style: 'section' },
				denuncianteBlock,
				{ text: '\n2. AFECTADOS (PERSONAS EN SITUACION DE VULNERACION O RIESGO)', style: 'section' },
				...afectadosBlocks,
				{ text: '\n3. DATOS DEL/LA DENUNCIADO(A)', style: 'section' },
				...denunciadosBlocks,
				{ text: '\n4. SOBRE EL HECHO', style: 'section' },
				...sobreHechosBlock,
				{ text: '\n5. VULNERACIONES POR AFECTADO', style: 'section' },
				...vulneracionesBlocks,
				{ text: '\n6. SOLICITUD', style: 'section' },
				...solicitudBlock,
				{ text: '\n7. MEDIDAS DE PROTECCIÓN POR AFECTADO', style: 'section' },
				...medidasBlocks,
				...firmaBlock
			],
			styles: {
				title: { fontSize: 16, bold: true },
				section: { fontSize: 12, bold: true, margin: [0, 8, 0, 4] },
				subLabel: { fontSize: 11, italics: true }
			},
			defaultStyle: { fontSize: 10 }
		};

		// Crear el pdf y enviar buffer
		// @ts-ignore
		const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);

		pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
			if (!res.headersSent) {
				res.setHeader('Content-Type', 'application/pdf');
				res.setHeader('Content-Disposition', 'attachment; filename=denuncia.pdf');
			}
			res.send(Buffer.from(buffer));
		});
	} catch (error: any) {
		console.error('Error generating PDF (pdfmake):', error);
		if (!res.headersSent) res.status(500).json({ ok: false, message: 'Error generating PDF', error: error?.message || error });
	}
}





