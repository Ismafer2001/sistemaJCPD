import { getAvocatoriaCompleta } from "../avocatoria.service";
import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from "html-to-pdfmake";

import { JSDOM } from "jsdom";

import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export async function crearPdfavocatoriaNNA(res: Response, idAvocatoria: any): Promise<void> {
	const dom = new JSDOM("");
	try {
		const data = await getAvocatoriaCompleta(idAvocatoria);
		const now = new Date();
		const tramite = data.codigoTramite || '—';
			const afectado: any = data.denuncia?.afectados?.[0] || {};
			const nombreAfectado = `${afectado.nombres || ''} ${afectado.apellidos || ''}`.trim();
			const edadAfectado = afectado.edad || '—';
			const canton = data.denuncia?.canton || '—';
			const fecha = data.fechaCreado ? new Date(data.fechaCreado) : now;
			const fechaTexto = `${fecha.getDate()} de ${fecha.toLocaleString('es-ES', { month: 'long' })} del año ${fecha.getFullYear()}`;
			const horaTexto = `${fecha.getHours()} horas con ${fecha.getMinutes()}`;
			const articulos =data.articulo
			const tipoDenuncia = data.denuncia?.tipoDenuncia || '—';
			const partePolicial = tipoDenuncia === 'oficio' ? `Oficio` : tipoDenuncia === 'denuncia' ? 'Denuncia' : '—';
			const fechaRecibido = fechaTexto;
			const denunciante: any = data.denuncia?.denunciante?.[0] || {};
			const nombreDenunciante = `${denunciante.nombres || ''} ${denunciante.apellidos || ''}`.trim();
			const denunciado: any = data.denuncia?.denunciados?.[0] || {};
			const nombreDenunciado = `${denunciado.nombres || ''} ${denunciado.apellidos || ''}`.trim();
			const hechos = data.denuncia?.descripcion_hechos || '—';

			// Tabla de vulneraciones identificadas por afectado
			const vulneracionesTables: any[] = [];
			if (Array.isArray(data.denuncia?.afectados) && data.denuncia.afectados.length) {
				for (const af of data.denuncia.afectados) {
					vulneracionesTables.push({ text: `Vulneraciones identificadas de ${af.nombres} ${af.apellidos}:`, style: 'section', margin: [0, 10, 0, 2] });
					const tableBody: any[] = [];
					tableBody.push([
						{ text: 'N°', bold: true, fillColor: '#eeeeee' },
						{ text: 'Vulneración', bold: true, fillColor: '#eeeeee' }
					]);
					if (Array.isArray(af.vulneraciones) && af.vulneraciones.length) {
						let num = 1;
						for (const v of af.vulneraciones) {
							tableBody.push([
								{ text: String(num), fontSize: 11 },
								{ text: v.vulneracion || '—', fontSize: 11 }
							]);
							num++;
						}
					} else {
						tableBody.push([
							{ text: '-', fontSize: 11 },
							{ text: '(No especificado)', fontSize: 11 }
						]);
					}
					vulneracionesTables.push({
						table: {
							widths: ['10%', '90%'],
							body: tableBody
						},
						margin: [0, 4, 0, 8]
					});
				}
			}

					// Construir el contenido principal
					const contentBlocks: any[] = [
						{ text: 'AVOCATORIA DE CONOCIMIENTO', style: 'title', alignment: 'center', margin: [0, 0, 0, 10] },
						{ text: `Trámite administrativo ${tramite}`, style: 'section' },
						{ text: `Niña. ${nombreAfectado} (${edadAfectado} años)`, style: 'section' },
						{ text: `Junta Cantonal de Protección de derechos del cantón ${canton}`, style: 'section' },
						{ text: `En el cantón ${canton}, a los ${fecha.getDate()} días del mes de ${fecha.toLocaleString('es-ES', { month: 'long' })} del año ${fecha.getFullYear()}, siendo los ${horaTexto}, en uso de las atribuciones que le confieren:`, margin: [0, 10, 0, 0] },
						articulos,
						{ text: 'AVOCA CONOCIMIENTO del:', style: 'section', margin: [0, 10, 0, 0] },
						{ text: `-parte policial N.-XXXXXX`, margin: [0, 0, 0, 0] },
						{ text: `-${partePolicial}`, margin: [0, 0, 0, 0] },
						{ text: `recibido en este organismo con fecha ${fechaRecibido}`, margin: [0, 0, 0, 0] },
						{ text: `por ${nombreDenunciante}`, margin: [0, 0, 0, 0] },
						{ text: 'En contra de', style: 'section', margin: [0, 10, 0, 0] },
						{ text: nombreDenunciado, margin: [0, 0, 0, 0] },
						{ text: 'quien hace conocer los hechos', margin: [0, 10, 0, 0] },
						{ text: hechos, margin: [0, 0, 0, 0] },
						{ text: 'Lo que se constituye una vulneración:', margin: [0, 10, 0, 0] },
						...vulneracionesTables,
						{ text: 'Por lo que esta Junta Cantonal de Protección de Derechos DISPONE:', style: 'section', margin: [0, 16, 0, 4] },
						 ...(data.disposiciones
							 ? htmlToPdfmake(data.disposiciones, dom.window).map((block: any) => ({ ...block, margin: [0, 0, 0, 10] }))
							 : [{ text: '(Sin disposiciones registradas)', margin: [0, 0, 0, 10] }]),
						{ text: 'Así mismo se disponen las medidas de protección:', style: 'section', margin: [0, 16, 0, 4] }
					];

					// Medidas de protección por afectado
					// Agrupar medidas emergentes por afectado
					const medidasPorAfectado: { [id: string]: any[] } = {};
					for (const m of data.medidasEmergentes || []) {
						if (!medidasPorAfectado[m.idAfectado]) medidasPorAfectado[m.idAfectado] = [];
						medidasPorAfectado[m.idAfectado].push(m);
					}
					const blocksMedidas: any[] = [];
					for (const idAfectado in medidasPorAfectado) {
						const af = (data.denuncia?.afectados || []).find((a: any) => String(a.id) === String(idAfectado));
						const nombreAf = af ? `${af.nombres} ${af.apellidos}` : `Afectado ${idAfectado}`;
						blocksMedidas.push({ text: `Medidas de protección para ${nombreAf}:`, style: 'subLabel', margin: [0, 8, 0, 2] });
						const tableBody: any[] = [];
						tableBody.push([
							{ text: 'N°', bold: true, fillColor: '#eeeeee' },
							{ text: 'Medida', bold: true, fillColor: '#eeeeee' },
							{ text: 'Periodo', bold: true, fillColor: '#eeeeee' },
							{ text: 'Observaciones', bold: true, fillColor: '#eeeeee' }
						]);
						let num = 1;
						for (const m of medidasPorAfectado[idAfectado]) {
							tableBody.push([
								{ text: String(num), fontSize: 11 },
								{ text: m.medida || '—', fontSize: 11 },
								{ text: m.periodo || '—', fontSize: 11 },
								{ text: m.observaciones || '—', fontSize: 11 }
							]);
							num++;
						}
						blocksMedidas.push({
							table: {
								widths: ['8%', '32%', '30%', '30%'],
								body: tableBody
							},
							margin: [0, 4, 0, 8]
						});
					}
					if (blocksMedidas.length === 0) {
						blocksMedidas.push({ text: '(No hay medidas de protección registradas)', margin: [0, 4, 0, 8] });
					}
					contentBlocks.push(...blocksMedidas);

					// Sección final de notificación y cumplimiento
					contentBlocks.push({ text: 'QUINTO. - Notifíquese con esta Avocatoria de Conocimiento a todas las partes para el cumplimiento de lo dispuesto.', margin: [0, 16, 0, 2] });
					contentBlocks.push({ text: 'NOTIFIQUESE Y CUMPLASE.', margin: [0, 8, 0, 2], style: 'section' });
					contentBlocks.push({ text: `f) Los Miembros de la Junta Cantonal de Protección de Derechos del cantón ${canton}`, margin: [0, 8, 0, 2] });

					// Sección de firmas
					contentBlocks.push({ text: 'SECCIÓN FIRMAS', style: 'section', margin: [0, 20, 0, 8] });
					const miembros = Array.isArray(data.usuariosPrincipales) ? data.usuariosPrincipales.slice(0, 3) : [];
					while (miembros.length < 3) {
						miembros.push({ nombres: '', apellidos: '', cargo: '' });
					}
					const tableFirmas: any[] = [];
					tableFirmas.push([
						{ text: '', border: [true, true, true, true], margin: [0, 20, 0, 20] },
						{ text: '', border: [true, true, true, true], margin: [0, 20, 0, 20] },
						{ text: '', border: [true, true, true, true], margin: [0, 20, 0, 20] }
					]);
					tableFirmas.push([
						{ text: `${miembros[0].nombres || ''} ${miembros[0].apellidos || ''}`, alignment: 'center', fontSize: 11 },
						{ text: `${miembros[1].nombres || ''} ${miembros[1].apellidos || ''}`, alignment: 'center', fontSize: 11 },
						{ text: `${miembros[2].nombres || ''} ${miembros[2].apellidos || ''}`, alignment: 'center', fontSize: 11 }
					]);
					tableFirmas.push([
						{ text: miembros[0].cargo || '', alignment: 'center', fontSize: 10, italics: true },
						{ text: miembros[1].cargo || '', alignment: 'center', fontSize: 10, italics: true },
						{ text: miembros[2].cargo || '', alignment: 'center', fontSize: 10, italics: true }
					]);
					contentBlocks.push({
						table: {
							widths: ['33%', '33%', '34%'],
							body: tableFirmas
						},
						margin: [0, 10, 0, 20]
					});

					const docDefinition: any = {
						content: contentBlocks,
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
				res.setHeader('Content-Disposition', 'attachment; filename=avocatoria.pdf');
			}
			res.send(Buffer.from(buffer));
		});
	} catch (error: any) {
		console.error('Error generating PDF (pdfmake):', error);
		if (!res.headersSent) res.status(500).json({ ok: false, message: 'Error generating PDF', error: error?.message || error });
	}
}