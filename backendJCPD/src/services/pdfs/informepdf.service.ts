
import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from "html-to-pdfmake";

import { JSDOM } from "jsdom";

import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { obtenerInformePorId } from '../informes.service';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export async function crearPdfinformeNNA(res: Response, idInforme: any): Promise<void> {
    const dom = new JSDOM("");
    try {
        const data = await obtenerInformePorId(idInforme);
        
        if (!data) {
            throw new Error('No se encontraron datos del informe');
        }
        
        const docDefinition = {
            content: [
                {
                    text: [
                        { text: 'Trámite Administrativo ' },
                        { text: data.codigoTramite || '', bold: true }
                    ],
                    style: 'title',
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: [
                        { text: data.canton || '', bold: true },
                        { text: ', ' },
                        { text: data.fechaCreado ? new Date(data.fechaCreado).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+), (\d+) de (\w+) de (\d+)/, '$1 $2, de $3 del $4') : '', bold: true }
                    ],
                    alignment: 'left',
                    margin: [0, 0, 0, 10]
                },
                {
                    text: [
                        { text: 'Oficio Nº ' },
                        { text: data.numeroOficio || '', bold: true }
                    ],
                    alignment: 'left',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Señor',
                    alignment: 'left',
                    margin: [0, 0, 0, 5]
                },
                ...(data.nombre ? [{
                    text: [{ text: data.nombre, bold: true }],
                    alignment: 'left',
                    margin: [0, 0, 0, 5]
                }] : []),
                ...(data.dirigidoA ? [{
                    text: [{ text: data.dirigidoA, bold: true }],
                    alignment: 'left',
                    margin: [0, 0, 0, 20]
                }] : []),
                {
                    text: [
                        { text: 'Por medio del presente le hacemos conocer las medidas de protección dispuestas en la AVOCATORIA DE CONOCIMIENTO, de fecha ' },
                        { text: data.fechaCreacionAvocatoria ? new Date(data.fechaCreacionAvocatoria).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\d+) de (\w+) de (\d+)/, '$1 de $2 del $3') : '', bold: true },
                        { text: ' para el presente trámite, misma que se transcribe a continuación:' }
                    ],
                    alignment: 'justify',
                    margin: [0, 0, 0, 20]
                },
                // Transcripción en formato HTML
                ...(data.transcripcion
                    ? htmlToPdfmake(data.transcripcion, dom.window).map((block: any) => ({ ...block, margin: [0, 0, 0, 20] }))
                    : [{ text: '(Sin transcripción registrada)', margin: [0, 0, 0, 20] }]),
                // Tabla de firmas
                {
                    table: {
                        widths: ['33%', '33%', '34%'],
                        body: [
                            ['', '', ''],
                            [
                                { text: '________________________', alignment: 'center', margin: [0, 40, 0, 5] },
                                { text: '________________________', alignment: 'center', margin: [0, 40, 0, 5] },
                                { text: '________________________', alignment: 'center', margin: [0, 40, 0, 5] }
                            ],
                            [
                                { text: (data.usuariosPrincipalesCanton && data.usuariosPrincipalesCanton[0]) ? `${data.usuariosPrincipalesCanton[0].nombres || ''} ${data.usuariosPrincipalesCanton[0].apellidos || ''}`.trim() : '', bold: true, alignment: 'center' },
                                { text: (data.usuariosPrincipalesCanton && data.usuariosPrincipalesCanton[1]) ? `${data.usuariosPrincipalesCanton[1].nombres || ''} ${data.usuariosPrincipalesCanton[1].apellidos || ''}`.trim() : '', bold: true, alignment: 'center' },
                                { text: (data.usuariosPrincipalesCanton && data.usuariosPrincipalesCanton[2]) ? `${data.usuariosPrincipalesCanton[2].nombres || ''} ${data.usuariosPrincipalesCanton[2].apellidos || ''}`.trim() : '', bold: true, alignment: 'center' }
                            ],
                            [
                                { text: data.usuariosPrincipalesCanton?.[0]?.cargo || '', alignment: 'center' },
                                { text: data.usuariosPrincipalesCanton?.[1]?.cargo || '', alignment: 'center' },
                                { text: data.usuariosPrincipalesCanton?.[2]?.cargo || '', alignment: 'center' }
                            ]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [0, 40, 0, 0]
                }
            ],
            styles: {
                title: { fontSize: 18, bold: true },
                section: { fontSize: 14, bold: true }
            },
            defaultStyle: { fontSize: 12 }
        };

        // Crear el pdf y enviar buffer
        // @ts-ignore
        const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
        pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=informe.pdf');
            }
            res.send(Buffer.from(buffer));
        });
    } catch (error: any) {
        console.error('Error generating PDF (pdfmake):', error);
        if (!res.headersSent) res.status(500).json({ ok: false, message: 'Error generating PDF', error: error?.message || error });
    }
}