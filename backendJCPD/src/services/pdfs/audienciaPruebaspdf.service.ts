
import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import { obtenerAudienciaPruebasCompleta } from '../audienciaPrueba.service';
// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;
export async function crearPdfAudienciaPruebasNNA(res: Response, idAudienciaP: any): Promise<void> {
  try {
    const pdfData = await obtenerAudienciaPruebasCompleta(idAudienciaP);

    const docDefinition = {
      content: [
        {
          text: [
            { text: 'ACTA DE LA AUDIENCIA DE PRUEBA CASO Nº ', bold: true, fontSize: 18 },
            { text: pdfData.codigoTramite || '', bold: true, fontSize: 18 }
          ],
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          text: (
            'En el Cantón ' + (pdfData.canton || '') +
            ' a los ' + (pdfData.fecha ? new Date(pdfData.fecha).getDate() : '') +
            ' días del mes de ' + (pdfData.fecha ? new Date(pdfData.fecha).toLocaleString('es-ES', { month: 'long' }) : '') +
            ' del año dos mil ' + (pdfData.fecha ? ('' + new Date(pdfData.fecha).getFullYear()).slice(-2) : '') + ', a las ' +
            (pdfData.hora ? new Date('1970-01-01T' + pdfData.hora).getHours() : '') +
            ' horas y ' + (pdfData.hora ? new Date('1970-01-01T' + pdfData.hora).getMinutes() : '') +
            ' minutos, ante la Junta Cantonal de Protección de Derechos de ' + (pdfData.canton || '') +
            ' integrada por los miembros principales'
          ),
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            { width: '*', text: '' },
            ...((pdfData.usuariosPrincipalesCanton || []).slice(0, 3).map((u: any) => ({
              width: 'auto',
              text: u.nombres + ' ' + u.apellidos,
              alignment: 'center',
              margin: [10, 20, 10, 0]
            }))),
            { width: '*', text: '' }
          ],
          columnGap: 30,
          margin: [0, 40, 0, 0]
        },
                {
                    text: 'Se instala la Audiencia de Pruebas tal como lo determina ' + (pdfData.instalacionAudiencia || ''),
                    margin: [0, 10, 0, 20]
                },
                {
                    text: 'Se constata la presencia de',
                    margin: [0, 10, 0, 10]
                },
                {
                    table: {
                        widths: ['auto', '*'],
                        body: [
                            [ { text: 'NOMBRE Y CEDULA PERSONA VULNERADA', bold: true },
                              (pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('afectado')).map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`).join(', ') ],
                            [ { text: 'NOMBRE Y CEDULA PERSONA VULNERADORA', bold: true },
                              (pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('denunciado')).map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`).join(', ') ],
                            [ { text: 'NOMBRE Y CEDULA PERSONA DENUNCIANTE', bold: true },
                              (pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('denunciante')).map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`).join(', ') ],
                            [ { text: 'NOMBRE Y CEDULA TESTIGOS', bold: true },
                              (pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('testigo')).map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`).join(', ') ],
                            [ { text: 'NOMBRE Y CEDULA ABOGADO', bold: true },
                              (pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('abogado')).map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`).join(', ') ]
                        ]
                    },
                    layout: 'box',
                    margin: [0, 0, 0, 20]
        },
        {
          text: (
            'En cumplimiento a lo que determina la Constitución de la República Art. 75, 76 y 76 numeral 1, se recepta la intervención de la Abogada ' +
            ((pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('abogado') && p.parte && p.parte.toLowerCase().includes('actora')).map((p: any) => `${p.nombres} ${p.apellidos}`).join(', ') || '') +
            ' en representación de la parte accionada; quien manifiesta que las pruebas a presentar a esta audiencia son: ' +
            ((pdfData.participantes || [])
              .filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('abogado') && p.parte && p.parte.toLowerCase().includes('actora'))
              .map((p: any) => p.pruebas)
              .filter((pruebas: any) => pruebas && pruebas.trim() !== '')
              .join('; ') || 'No registradas')
          ),
          margin: [0, 0, 0, 20]
  },
        // Iterar testimonios de la parte actora
        ...((pdfData.participantesConTestimonio || [])
          .filter((p: any) => p.parte && p.parte.toLowerCase().includes('actora'))
          .map((p: any, idx: number) => [
            {
              text: `PRUEBA TESTIMONIAL ${idx + 1} DE LA PARTE ACTORA`,
              bold: true,
              margin: [0, 20, 0, 5]
            },
            {
              text: p.testimonio || '(Sin testimonio registrado)',
              italics: true,
              margin: [0, 0, 0, 10]
            },
            {
              text: 'Para constancia de lo expuesto en su testimonio firma:',
              margin: [0, 0, 0, 10]
            },
            {
              canvas: [
                { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }
              ],
              margin: [0, 0, 0, 2]
            },
            {
              text: `${p.nombres} ${p.apellidos}`,
              alignment: 'left',
              margin: [0, 0, 0, 0]
            },
            {
              text: `c.c. ${p.cedula}`,
              alignment: 'left',
              margin: [0, 0, 0, 0]
            }
          ])
        ).reduce((acc: any[], arr: any[]) => acc.concat(arr), []),
        // Intervención del abogado de la parte accionada
        {
          text: (
            'Se procede a receptar la intervención del Abogado ' +
            ((pdfData.participantes || [])
              .filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('abogado') && p.parte && p.parte.toLowerCase().includes('accionada'))
              .map((p: any) => `${p.nombres} ${p.apellidos}`)
              .join(', ') || '') +
            ' en representación de la parte accionada quien manifiesta que las pruebas a presentar a esta audiencia son: ' +
            ((pdfData.participantes || [])
              .filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('abogado') && p.parte && p.parte.toLowerCase().includes('accionada'))
              .map((p: any) => p.pruebas)
              .filter((pruebas: any) => pruebas && pruebas.trim() !== '')
              .join('; ') || 'No registradas')
          ),
          margin: [0, 20, 0, 20]
        },
        // Iterar testimonios de la parte accionada
        ...((pdfData.participantesConTestimonio || [])
          .filter((p: any) => p.parte && p.parte.toLowerCase().includes('accionada'))
          .map((p: any, idx: number) => [
            {
              text: `PRUEBA TESTIMONIAL ${idx + 1} DE LA PARTE ACCIONADA`,
              bold: true,
              margin: [0, 20, 0, 5]
            },
            {
              text: p.testimonio || '(Sin testimonio registrado)',
              italics: true,
              margin: [0, 0, 0, 10]
            },
            {
              text: 'Para constancia de lo expuesto en su testimonio firma:',
              margin: [0, 0, 0, 10]
            },
            {
              canvas: [
                { type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }
              ],
              margin: [0, 0, 0, 2]
            },
            {
              text: `${p.nombres} ${p.apellidos}`,
              alignment: 'left',
              margin: [0, 0, 0, 0]
            },
            {
              text: `c.c. ${p.cedula}`,
              alignment: 'left',
              margin: [0, 0, 0, 0]
            }
          ])
        ).reduce((acc: any[], arr: any[]) => acc.concat(arr), []),
        // Párrafo de cierre y deliberación
        {
          text: [
            'Una vez escuchadas las versiones de las partes, y receptadas todas las pruebas; se les pide que abandonen momentáneamente la sala para dar paso a la audiencia reservada con el adolescente ',
            (pdfData.participantes || [])
              .filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('afectado'))
              .map((p: any) => `${p.nombres} ${p.apellidos}`)
              .join(', '),
            '. Quién indica:\n',
            pdfData.afectadoManifiesta || '(Sin manifestación registrada)',
            '\nSe procede con la deliberación de los miembros de la Junta.\nTranscurrido una hora, la Junta Cantonal de Derechos pide que se convoque a las partes a la sala y se reinicia la Audiencia dando paso a la lectura de la presente acta, en la que se considera que se trata de una vulneración:'
          ],
          margin: [0, 20, 0, 20]
        },
        // Vulneraciones por afectado, nombre fuera de la tabla
        ...((pdfData.vulneracionesPorAfectado || []).flatMap((afectado: any) => [
          {
            text: `Afectado: ${(afectado.nombres || '') + ' ' + (afectado.apellidos || '')}`.trim(),
            bold: true,
            margin: [0, 10, 0, 5]
          },
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: 'VULNERACIÓN', bold: true, fillColor: '#eeeeee' },
                  { text: 'DETALLE', bold: true, fillColor: '#eeeeee' }
                ],
                ...((afectado.vulneraciones || []).map((v: any) => [
                  v.vulneracion || '',
                  v.detalles || ''
                ]))
              ]
            },
            layout: 'box',
            margin: [0, 0, 0, 20]
          }
        ])),
        // Texto y tabla de medidas de protección (siempre después de vulneraciones)
        {
          text: 'Y se establecen las siguientes medidas de protección:',
          bold: true,
          margin: [0, 10, 0, 5]
        },
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
      // Sección de firmas al final, después de todas las medidas
      {
        text: 'SECCION FIRMAS',
        bold: true,
        fontSize: 14,
        alignment: 'center',
        margin: [0, 30, 0, 20]
      },
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            stack: (pdfData.usuariosPrincipalesCanton || []).map((u: any) => [
              { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 } ], margin: [0, 10, 0, 0] },
              { text: u.nombres + ' ' + u.apellidos, alignment: 'center', margin: [0, 0, 0, 10] }
            ])
          },
          { width: '*', text: '' }
        ],
        columnGap: 10,
        margin: [0, 20, 0, 20]
      },
      {
        columns: [
          {
            width: 'auto',
            stack: [
              ...((pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('denunciante')).map((p: any) => [
                { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 } ], margin: [0, 10, 0, 0] },
                { text: p.nombres + ' ' + p.apellidos, alignment: 'center', margin: [0, 0, 0, 10] }
              ])).flat(),
            ]
          },
          {
            width: 'auto',
            stack: [
              ...((pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('abogado') && p.parte && p.parte.toLowerCase().includes('actora')).map((p: any) => [
                { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 } ], margin: [0, 10, 0, 0] },
                { text: p.nombres + ' ' + p.apellidos, alignment: 'center', margin: [0, 0, 0, 10] }
              ])).flat(),
            ]
          }
        ],
        columnGap: 60,
        margin: [0, 20, 0, 20]
      },
      {
        columns: [
          {
            width: 'auto',
            stack: [
              ...((pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('denunciado')).map((p: any) => [
                { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 } ], margin: [0, 10, 0, 0] },
                { text: p.nombres + ' ' + p.apellidos, alignment: 'center', margin: [0, 0, 0, 10] }
              ])).flat(),
            ]
          },
          {
            width: 'auto',
            stack: [
              ...((pdfData.participantes || []).filter((p: any) => p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('abogado') && p.parte && p.parte.toLowerCase().includes('accionada')).map((p: any) => [
                { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 1 } ], margin: [0, 10, 0, 0] },
                { text: p.nombres + ' ' + p.apellidos, alignment: 'center', margin: [0, 0, 0, 10] }
              ])).flat(),
            ]
          }
        ],
        columnGap: 60,
        margin: [0, 20, 0, 20]
      },
      ],
      
      
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
    console.error('Error al generar el PDF de audiencia de prueba:', error);
    if (!res.headersSent) {
      res.status(500).send('Error al generar el PDF de audiencia de prueba');
    }
  }
}