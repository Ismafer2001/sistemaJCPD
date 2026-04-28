
import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from "html-to-pdfmake";

import { JSDOM } from "jsdom";

import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { text } from "stream/consumers";
import { obtenerDatosProvidenciaCompleta } from "../providencia.service";
import { RegistrarLoggs } from '../loggs.service';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export async function crearPdfProvidenciaNNA(res: Response, idProvidencia: any, idUsuario:number,usuario:string,nombres:string,canton:string): Promise<void> {
    const dom = new JSDOM("");
    try {
        const data = await obtenerDatosProvidenciaCompleta(idProvidencia);
        
        if (!data) {
            throw new Error('No se encontraron datos de la providencia');
        }
        
        const docDefinition = {
            content: [
                {
                    text: [
                        { text: 'Providencia administrativa N° ', bold: true, fontSize: 18 },
                        { text: data.codigoTramite || '', bold: true, fontSize: 18 }
                    ],
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: [
                        { text: 'Los Miembros de la Junta Cantonal de Protección de Derechos del Cantón ' },
                        { text: data.canton || '', bold: true },
                        { text: ', en ejercicio de nuestras funciones como autoridad competente para otorgar medidas administrativas de protección a favor de Niños, niñas y adolescentes, establecidas en los ' },
                        { text: data.articulos || '', bold: true },
                        { text: ', siendo el día ' },
                        { text: data.fecha_creado ? new Date(data.fecha_creado).toLocaleDateString('es-ES', { weekday: 'long' }) : '', bold: true },
                        { text: ' ' },
                        { text: data.fecha_creado ? new Date(data.fecha_creado).getDate().toString() : '', bold: true },
                        { text: ' de ' },
                        { text: data.fecha_creado ? new Date(data.fecha_creado).toLocaleDateString('es-ES', { month: 'long' }) : '', bold: true },
                        { text: ' del ' },
                        { text: data.fecha_creado ? new Date(data.fecha_creado).getFullYear().toString() : '', bold: true },
                        { text: ' a las ' },
                        { text: data.fecha_creado ? new Date(data.fecha_creado).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + 'h' : '', bold: true },
                        { text: ', AVOCAMOS CONOCIMIENTO del ' },
                        { text: data.suscrito || '', bold: true },
                        { text: ' suscrito por  ' },
                        { text: data.nombreSuscrito || '', bold: true },
                        { text: ', ' },
                        { text: data.cargoSuscrito || '', bold: true },
                        { text: ' de ' },
                        { text: data.institucionSuscrito || '', bold: true },
                        { text: ', de fecha ' },
                        { text: data.fechaSuscrito ? new Date(data.fechaSuscrito).toLocaleDateString('es-ES') : '', bold: true },
                        { text: ' siendo las ' },
                        { text: data.fechaSuscrito ? new Date(data.fechaSuscrito).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + 'h' : '', bold: true },
                        { text: '. En virtud de los derechos consagrados en la Constitución de República del Ecuador en su Art. 66 numeral 2 y 3 el derecho a una vida digna, El derecho a una vida digna, que asegure la salud, alimentación y nutrición, agua potable, vivienda, saneamiento ambiental, educación, trabajo, empleo, descanso y ocio, cultura física, vestido, seguridad social y otros servicios sociales necesarios. El derecho a la integridad personal, que incluye: La integridad física, psíquica, moral y sexual. b) Una vida libre de violencia en el ámbito público y privado. El Estado adoptará las medidas necesarias para prevenir, eliminar y sancionar toda forma de violencia, en especial la ejercida contra las mujeres, niñas, niños y adolescentes, personas adultas mayores, personas con discapacidad y contra toda persona en situación de desventaja o vulnerabilidad; idénticas medidas se tomarán contra la violencia, la esclavitud y la explotación sexual, a su vez el art. 44 inciso segundo Las niñas, niños y adolescentes tendrán derecho a su desarrollo integral, entendido como proceso de crecimiento, maduración y despliegue de su intelecto y de sus capacidades, potencialidades y aspiraciones, en un entorno familiar, escolar, social y comunitario de afectividad y seguridad. Este entorno permitirá la satisfacción de sus necesidades sociales, afectivo-emocionales y culturales, con el apoyo de políticas intersectoriales nacionales y locales,  de la misma manera el Art. 67 del Código de la Niñez y adolescencia establece que, se entiende por maltrato toda conducta, de acción u omisión, que provoque o pueda provocar daño a la integridad o salud física, psicológica o sexual de un niño, niña o adolescente, por parte de cualquier persona, incluidos sus progenitores, otros parientes, educadores y personas a cargo de su cuidado; cualesquiera sean el medio utilizado para el efecto, sus consecuencias y el tiempo necesario para la recuperación de la víctima. Se incluyen en esta calificación el trato negligente o descuido grave o reiterado en el cumplimiento de las obligaciones para con los niños, niñas y adolescentes, relativas a la prestación de alimentos, alimentación, atención médica educación o cuidados diarios, con relación al Código de Niñez y Adolescencia en el Art. 11.- El interés superior del niño es un principio que está orientado a satisfacer el ejercicio efectivo del conjunto de los derechos de los niños, niñas y adolescentes; e impone a todas las autoridades administrativas y judiciales y a las instituciones públicas y privadas, el deber de ajustar sus decisiones y acciones para su cumplimiento, en este sentido, esta autoridad administrativa. Por lo que esta autoridad administrativa en uso de nuestras atribuciones DISPONE:' }
                    
                    ],

                    alignment: 'justify',
                    margin: [0, 0, 0, 20]
                },
                // Disposiciones en formato HTML
                ...(data.disposiciones
                    ? htmlToPdfmake(data.disposiciones, dom.window).map((block: any) => ({ ...block, margin: [0, 0, 0, 20] }))
                    : [{ text: '(Sin disposiciones registradas)', margin: [0, 0, 0, 20] }]),
                
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
                                { text: (data.usuariosPrincipalesCanton && data.usuariosPrincipalesCanton[0]) ? `${data.usuariosPrincipalesCanton[0].nombres || ''} ${data.usuariosPrincipalesCanton[0].apellidos || ''}`.trim() : '', alignment: 'center', fontSize: 11 },
                                { text: (data.usuariosPrincipalesCanton && data.usuariosPrincipalesCanton[1]) ? `${data.usuariosPrincipalesCanton[1].nombres || ''} ${data.usuariosPrincipalesCanton[1].apellidos || ''}`.trim() : '', alignment: 'center', fontSize: 11 },
                                { text: (data.usuariosPrincipalesCanton && data.usuariosPrincipalesCanton[2]) ? `${data.usuariosPrincipalesCanton[2].nombres || ''} ${data.usuariosPrincipalesCanton[2].apellidos || ''}`.trim() : '', alignment: 'center', fontSize: 11 }
                            ],
                            [
                                { text: 'Miembro-a Principal', alignment: 'center', fontSize: 11 },
                                { text: 'Miembro-a Principal', alignment: 'center', fontSize: 11 },
                                { text: 'Miembro-a Principal', alignment: 'center', fontSize: 11 }
                            ]
                        ]
                    },
                    margin: [0, 10, 0, 20]
                }
            ]
        };

        // Crear el pdf y enviar buffer
        // @ts-ignore
        const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
        pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=providencia.pdf');
            }
            res.send(Buffer.from(buffer));
        });
        RegistrarLoggs({
                          idUsuario: idUsuario,
                          usuario:usuario ,
                          nombres: nombres,
                          fase:'providencia',
                          accion:'GENERATE' ,
                          descripcion:` ${usuario} acaba de generar pdf de audiencia de pruebas con  codigo de expediente ${data.codigoTramite}` ,
                          canton:canton
                          
                          });
    } catch (error: any) {
        console.error('Error generating PDF (pdfmake):', error);
        if (!res.headersSent) res.status(500).json({ ok: false, message: 'Error generating PDF', error: error?.message || error });
    }
}