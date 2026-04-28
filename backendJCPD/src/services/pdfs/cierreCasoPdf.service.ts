
import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from "html-to-pdfmake";

import { JSDOM } from "jsdom";

import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { text } from "stream/consumers";
import { getDatosCierreCasoCompleto } from "../../controllers/cierreCaso.controller";
import { obtenerDatosCierreCasoCompleto } from '../cierreCaso.service';
import { RegistrarLoggs } from '../loggs.service';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export async function crearPdfCierreCaso(res: Response, idCierreCaso: any, idUsuario:number,usuario:string,nombres:string,canton:string): Promise<void> {
    const dom = new JSDOM("");
    try {
        const data = await obtenerDatosCierreCasoCompleto(idCierreCaso);
        
        const docDefinition = {
            content: [
                {
                    text: 'CIERRE DE CASO',
                    bold: true,
                    fontSize: 18,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                },
                {
                    text: [
                        { text: 'CASO No. ', bold: true, fontSize: 14 },
                        { text: data.cierreCaso?.codigoTramite || '', bold: true, fontSize: 14 }
                    ],
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: [
                        { text: 'LA JUNTA CANTONAL DE PROTECCIÓN DE DERECHOS, A los ' },
                        { text: new Date().getDate().toString(), bold: true },
                        { text: ' días del mes de ' },
                        { text: new Date().toLocaleString('es-ES', { month: 'long' }), bold: true },
                        { text: ' del ' },
                        { text: new Date().getFullYear().toString(), bold: true },
                        { text: '.- las ' },
                        { text: new Date().getHours().toString().padStart(2, '0'), bold: true },
                        { text: 'h00.' }
                    ],
                    alignment: 'justify',
                    margin: [0, 0, 0, 20]
                },
                // Bucle para cada informe presentado
                ...((data.informesPresentados || []).map((informe: any) => ({
                    text: [
                        { text: 'De los informes presentados (' },
                        { text: informe.informe || '', bold: true },
                        { text: ') por ' },
                        { text: informe.nombreTecnico || '', bold: true },
                        { text: ', con fecha ' },
                        { text: informe.fechaCreado ? new Date(informe.fechaCreado).toLocaleDateString('es-ES') : '', bold: true },
                        { text: ' del presente año, en donde manifiestan que: "se ha venido realizando visitas de seguimiento al ' },
                        { text: informe.lugar || '', bold: true },
                        { text: ' de manera imprevista donde se verifica que ' },
                        { text: informe.personaEvaluada || '', bold: true },
                        { text: ' está cumpliendo las medidas de protección dictadas por la JCPD-' },
                        { text: informe.canton || '', bold: true },
                        { text: '"' }
                    ],
                    alignment: 'justify',
                    margin: [0, 0, 0, 15]
                }))),
                // Párrafo de conclusión
                ...(data.cierreCaso?.conclusion
                    ? htmlToPdfmake(data.cierreCaso.conclusion, dom.window).map((block: any) => ({ ...block, margin: [0, 0, 0, 20] }))
                    : [{ text: '(Sin conclusión registrada)', margin: [0, 0, 0, 20] }]),
                // Sección de firmas
                {
                    text: 'SECCIÓN FIRMAS',
                    bold: true,
                    fontSize: 14,
                    alignment: 'center',
                    margin: [0, 30, 0, 20]
                },
                {
                    table: {
                        widths: ['33%', '33%', '34%'],
                        body: [
                            [
                                { text: '', border: [true, true, true, true], margin: [0, 30, 0, 30] },
                                { text: '', border: [true, true, true, true], margin: [0, 30, 0, 30] },
                                { text: '', border: [true, true, true, true], margin: [0, 30, 0, 30] }
                            ],
                            [
                                { text: (data.usuariosPrincipales && data.usuariosPrincipales[0]) ? `${data.usuariosPrincipales[0].nombres || ''} ${data.usuariosPrincipales[0].apellidos || ''}`.trim() : '', alignment: 'center', fontSize: 11 },
                                { text: (data.usuariosPrincipales && data.usuariosPrincipales[1]) ? `${data.usuariosPrincipales[1].nombres || ''} ${data.usuariosPrincipales[1].apellidos || ''}`.trim() : '', alignment: 'center', fontSize: 11 },
                                { text: (data.usuariosPrincipales && data.usuariosPrincipales[2]) ? `${data.usuariosPrincipales[2].nombres || ''} ${data.usuariosPrincipales[2].apellidos || ''}`.trim() : '', alignment: 'center', fontSize: 11 }
                            ],
                            [
                                { text: 'Miembro-a Principal', alignment: 'center', fontSize: 11 },
                                { text: 'Miembro-a Principal', alignment: 'center', fontSize: 11 },
                                { text: 'Miembro-a Principal', alignment: 'center', fontSize: 11 }
                            ]
                        ]
                    },
                    margin: [0, 10, 0, 20]
                },
                {
                    text: [
                        { text: 'Actúe el Secretario Auxiliar (' },
                        { text: data.cierreCaso?.secretariaAuxiliar || '', bold: true },
                        { text: ') CÚMPLASE.' }
                    ],
                    margin: [0, 20, 0, 20]
                },
                {
                    canvas: [
                        { type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }
                    ],
                    margin: [0, 20, 0, 5]
                },
                {
                    text: data.cierreCaso?.secretariaAuxiliar || '',
                    fontSize: 11,
                    margin: [0, 0, 0, 20]
                }
            ]
        };

        // Crear el pdf y enviar buffer
        // @ts-ignore
        const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
        pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=CierreCaso.pdf');
            }
            res.send(Buffer.from(buffer));
        });
         RegistrarLoggs({
                            idUsuario: idUsuario,
                            usuario:usuario ,
                            nombres: nombres,
                            fase:'cierre de caso',
                            accion:'GENERATE' ,
                            descripcion:` ${usuario} acaba de generar pdf de cierre de caso con  codigo de expediente ${data.cierreCaso.codigoTramite}` ,
                            canton:canton
                            
                          });
    } catch (error: any) {
        console.error('Error generating PDF (pdfmake):', error);
        if (!res.headersSent) res.status(500).json({ ok: false, message: 'Error generating PDF', error: error?.message || error });
    }
}