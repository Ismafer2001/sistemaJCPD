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
		console.log('Datos completos para PDF:', pdfData);

		const now = new Date();
		// tipo de denuncia
		const tipoDenuncia = pdfData.denuncia?.tipo_denuncia;
		let señoresMiembrosPrincipales={}; 
		if (tipoDenuncia === 'externa') {
			 señoresMiembrosPrincipales = 
			{ text: 'SEÑORES MIEMBROS PRINCIPALES DE LA JUNTA CANTONAL DE PROTECCIÓN DE DERECHOS ',bold: true, alignment: 'center' }
		}else{
			 señoresMiembrosPrincipales = 
			{ text: 'NOSOTROS MIEMBROS PRINCIPALES DE LA JUNTA CANTONAL DE PROTECCIÓN DE DERECHOS  ',bold: true, alignment: 'center' }
		}
		
		// Bloques de denunciante
		const denunciante = pdfData.denunciantes && pdfData.denunciantes.length ? pdfData.denunciantes[0] : {};
		const denuncianteBlock = {
			table: {
				widths: ['30%', '70%'],
				body: [
					[{ text: 'Nombres', bold: true, fontSize: 12 },{ text: `${denunciante?.nombres  || ''}`, fontSize: 12 }],
					[{ text: 'Apellidos', bold: true, fontSize: 12 },{ text: `${denunciante?.apellidos || ''}`, fontSize: 12 }],
					[{ text: 'Cédula', bold: true, fontSize: 12 },{ text: `${denunciante?.cedula || ''}`, fontSize: 12 }],
					[{ text: 'Nacionalidad', bold: true, fontSize: 12 },{ text: `${denunciante?.nacionalidad || ''}`, fontSize: 12 }],
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
							   [{ text: 'Cédula', bold: true, fontSize: 12 }, { text: a?.cedula || '', fontSize: 12 }],
							   [{ text: 'Nacionalidad', bold: true, fontSize: 12 },{ text: a?.nacionalidad || '', fontSize: 12 }],
							   [{ text: 'Edad', bold: true, fontSize: 12 }, { text: (a?.edad === 0 ? (a?.meses ? a.meses + ' meses' : '0') : a?.edad) || '', fontSize: 12 }],
							   [{ text: 'Sexo', bold: true, fontSize: 12 }, { text: a?.sexo || '', fontSize: 12 }],
							   [{ text: 'Dirección', bold: true, fontSize: 12 },{ text: a?.direccion || '', fontSize: 12 }],
                           
							   [{ text: 'Teléfono / Mail', bold: true, fontSize: 12 },{ text: `${a?.telefono || ''} / ${a?.mail || ''}`, fontSize: 12 }]
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
							[{ text: 'Cédula', bold: true, fontSize: 12 }, { text: d?.cedula || '', fontSize: 12 }],
							[{ text: 'Nacionalidad', bold: true, fontSize: 12 },{ text: `${d?.nacionalidad || ''}`, fontSize: 12 }],
							[{ text: 'Edad', bold: true, fontSize: 12 }, { text: d?.edad || '', fontSize: 12 }],
							[{ text: 'Sexo', bold: true, fontSize: 12 }, { text: d?.sexo || '', fontSize: 12 }],
							[{ text: 'Dirección', bold: true, fontSize: 12 }, { text: d?.direccion || '', fontSize: 12 }],
							[{ text: 'Teléfono / Mail', bold: true, fontSize: 12 },{ text: `${d?.telefono || ''} / ${d?.mail || ''}`, fontSize: 12 }],
							[{ text: 'Parentesco con persona afectada', bold: true, fontSize: 12 }, { text: d?.parentezco || '', fontSize: 12 }],
							
						]
					},
					margin: [0, 4, 0, 8]
				});
			}
		} else {
			denunciadosBlocks.push({ text: '(No especificado)', margin: [0, 4, 0, 8] });
		}

		// Bloque sobre los hechos
		const sobreHechosBlock = 
			
			{ text: pdfData?.denuncia?.descripcion_hechos || '(Sin descripción proporcionada)', margin: [0, 0, 0, 10] }
		

		// Tabla de violencia (solo para mujeres)
		const violenciaBlock: any[] = [];
		if (pdfData.denuncia?.grupoPrioritario === 'mujeres' && pdfData.datosViolencia) {
			violenciaBlock.push({
				table: {
					widths: ['30%', '70%'],
					body: [
						[
							{ text: 'Tipo de Violencia', bold: true, fontSize: 12 },
							{ text: pdfData.datosViolencia?.tipoDeViolencia || '(No especificado)', fontSize: 12 }
						],
						[
							{ text: 'Ámbito de Violencia', bold: true, fontSize: 12 },
							{ text: pdfData.datosViolencia?.ambitoViolencia || '(No especificado)', fontSize: 12 }
						]
					]
				},
				margin: [0, 4, 0, 8]
			});
		}

		// Vulneraciones por afectado
		const vulneracionesBlocks: any[] = [];
		if (Array.isArray(pdfData.vulneraciones) && pdfData.vulneraciones.length) {
			for (const v of pdfData.vulneraciones) {
				vulneracionesBlocks.push({ text: `Vulneraciones de ${v.nombre} `, style: 'subLabel', margin: [0, 6, 0, 2] });
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
		const solicitudBlock = 
			
			{ text: pdfData?.denuncia?.solicitud || '(Sin solicitud proporcionada)', margin: [0, 0, 0, 10] }
		

		// Medidas por afectado
		const medidasBlocks: any[] = [];
		if (Array.isArray(pdfData.medidas) && pdfData.medidas.length) {
			for (const m of pdfData.medidas) {
				medidasBlocks.push({ text: `Medidas de protección de ${m.nombre} `, style: 'subLabel', margin: [0, 6, 0, 2] });
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
			{ text: '\n\n___________________________', margin: [0, 20, 0, 0] },
			{ text: `Nombres y apellidos: ${denunciante?.nombres || ''} ${denunciante?.apellidos || ''}`, margin: [0, 2, 0, 0] },
			{ text: `Cédula: ${denunciante?.cedula || ''}`, margin: [0, 2, 0, 0] }
		];

		const docDefinition: any = {
			info: {
				title: `Denuncia-${pdfData.denuncia?.codigoTramite || 'SIN_CODIGO'}`,
				author: 'JCPD',
				creationDate: now
			},
			content: [
				{ text: ` Denuncia: ${pdfData.denuncia?.codigoTramite || 'SIN_CODIGO'}`, style: 'title', alignment: 'center' },
				{ text: '\n' },
				señoresMiembrosPrincipales,
				{ text: '1. DATOS DEL/LA DENUNCIANTE', style: 'section' },
				denuncianteBlock,
				{ text: '\n2. AFECTADOS (PERSONAS EN SITUACION DE VULNERACION O RIESGO)', style: 'section' },
				...afectadosBlocks,
				{ text: '\n3. DATOS DEL/LA DENUNCIADO(A)', style: 'section' },
				...denunciadosBlocks,
				{ text: '\n4. SOBRE EL HECHO', style: 'section' },
				sobreHechosBlock,
				...violenciaBlock,
				{ text: '\n5. VULNERACIONES POR AFECTADO', style: 'section' },
				...vulneracionesBlocks,
				{ text: '\n6. SOLICITUD', style: 'section' },
				solicitudBlock,
				{ text: '\n7. MEDIDAS DE PROTECCIÓN POR AFECTADO', style: 'section' },
				...medidasBlocks,
				{ text: '\nEs justicia,etc' },
				...firmaBlock
			],
			styles: {
				title: { fontSize: 14, bold: true },
				section: { fontSize: 12, bold: true, margin: [0, 8, 0, 4] },
				subLabel: { fontSize: 12, }
			},
			defaultStyle: { fontSize: 12 }
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





