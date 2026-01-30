

import { Response } from 'express';

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { obtenerAudienciaContestacionCompleta } from '../aucienciaContestacion.service';

// Asegurar vfs para pdfMake
// @ts-ignore
(pdfMake as any).vfs = (pdfFonts as any).vfs;

export async function crearPdfAudienciaContestacionNNA(res: Response, idAudiencia: any): Promise<void> {
  let filaInstituciones: any = [];
  try {

  const datos = await obtenerAudienciaContestacionCompleta(idAudiencia);
    // Instituciones participantes: tipoParticipante incluye 'institucion' o 'institucional'
    filaInstituciones = (() => {
      const lista = (datos.participantes || [])
        .filter((x: any) => x.tipoParticipante && x.tipoParticipante.toLowerCase().includes('representante institucional'))
        .map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`)
        .join(', ');
      return [[{ text: 'Nombre y cédula de representante institucional', bold: true }, lista]];
    })();

  // Representantes Proyectos: tipoParticipante incluye 'representantes proyectos'
  const filaRepresentantesProyectos = (() => {
    const lista = (datos.participantes || [])
      .filter((x: any) => x.tipoParticipante && x.tipoParticipante.toLowerCase().includes('representante proyecto'))
      .map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`)
      .join(', ');
    return [[{ text: 'Nombre y cédula de representantes proyectos', bold: true }, lista]];
  })();
  const codigoTramite = datos && datos.codigoTramite ? datos.codigoTramite : '';
  // Usar los campos correctos según el DTO
  const fecha = datos.fechaAvocatoria || '';
  const canton = datos.canton || '';
  const hora = datos.hora || '';
  console.log('horaaaa'+hora)

  // Extraer nombres de participantes por tipo
    const getNombresPorTipo = (tipo: string) => {
      return (datos.participantes || [])
        .filter((x: any) => x.tipoParticipante && x.tipoParticipante.toLowerCase().includes(tipo))
        .map((p: any) => `${p.nombres} ${p.apellidos}`)
        .join(', ');
    };
    const nombresPersonaVulnerada = getNombresPorTipo('afectado');
    const nombresPersonaVulneradora = getNombresPorTipo('denunciado');
    const nombresPersonaDenunciante = getNombresPorTipo('denunciante');
    const nombresTestigo = getNombresPorTipo('testigo');
  // Extraer nombres y cédulas de participantes por tipo
  const getNombresCedulasPorTipoAsistio = (tipo: string) => {
    return (datos.participantes || [])
      .filter((x: any) => x.tipoParticipante && x.tipoParticipante.toLowerCase().includes(tipo) && x.asistio)
      .map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`)
      .join(', ');
  };
  const nombresCedulasVulnerada = getNombresCedulasPorTipoAsistio('afectado');
  const nombresCedulasVulneradora = getNombresCedulasPorTipoAsistio('denunciado');
  const nombresCedulasDenunciante = getNombresCedulasPorTipoAsistio('denunciante');
  const nombresCedulasTestigo = getNombresCedulasPorTipoAsistio('testigo');

  // Nombres y cédulas de vulnerados (pueden ser todos, no solo los que asistieron)
  // Una sola fila: primera celda el título, segunda celda todos los nombres y cédulas separados por coma
  const getFilaVulnerados = () => {
    const lista = (datos.participantes || [])
      .filter((x: any) => x.tipoParticipante && x.tipoParticipante.toLowerCase().includes('afectado'))
      .map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`)
      .join(', ');
    return [[{ text: 'Nombre y cédula de vulnerado', bold: true }, lista]];
  };
  const filaVulnerados = getFilaVulnerados();

  // Inasistentes: quienes no asistieron
  const getFilaInasistentes = () => {
    const lista = (datos.participantes || [])
      .filter((x: any) => x.tipoParticipante && !x.asistio)
      .map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`)
      .join(', ');
    return [[{ text: 'Nombre y cédula', bold: true }, lista]];
  };
  const filaInasistentes = getFilaInasistentes();

  // Tabla de justificación de inasistencia
  const getTablaJustificacion = () => {
    const justificados = (datos.participantes || [])
      .filter((x: any) => x.tipoParticipante && !x.asistio && x.justifico)
      .map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`);
    const noJustificados = (datos.participantes || [])
      .filter((x: any) => x.tipoParticipante && !x.asistio && !x.justifico)
      .map((p: any) => `${p.nombres} ${p.apellidos} (${p.cedula})`);
    return [
      [ { text: 'SI', bold: true }, { text: 'NO', bold: true } ],
      [ justificados.join(', '), noJustificados.join(', ') ]
    ];
  };
  const tablaJustificacion = getTablaJustificacion();

    // Construir el docDefinition con el título solicitado y la tabla de datos generales
    const docDefinition = {
  content: [
        // ...existing code...
        {
          text: [
            { text: 'ACTA DE LA AUDIENCIA DEL CASO Nº ', bold: true, fontSize: 18 },
            { text: codigoTramite, bold: true, fontSize: 18 }
          ],
          alignment: 'center',
          margin: [0, 0, 0, 0]
        },
        { text: 'Datos Generales', style: 'subheader', margin: [0, 0, 0, 0] },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              [ { text: 'Fecha', bold: true }, fecha ? new Date(fecha).toLocaleDateString() : '' ],
              [ { text: 'Cantón', bold: true }, canton ],
              [ { text: 'Hora', bold: true }, hora ? hora.toString().substring(0, 5) : '' ]
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        { text: 'Participantes', style: 'subheader', margin: [0, 10, 0, 0] },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              [ { text: 'Nombre persona afectada', bold: true }, nombresPersonaVulnerada ],
              [ { text: 'Nombre persona denunciado', bold: true }, nombresPersonaVulneradora ],
              [ { text: 'Nombre persona denunciante', bold: true }, nombresPersonaDenunciante ],
              [ { text: 'Nombre testigo', bold: true }, nombresTestigo ]
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        {
          text: [
            'Se instala la Audiencia de contestación prevista en ',
            { text: datos.instalacionAudiencia || '', bold: true },
            ' según la Avocatoria de Conocimiento N.- ',
            { text: codigoTramite, bold: true },
            ' de fecha ',
            { text: fecha ? new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+), (\d+) de (\w+) de (\d+)/, '$1 $2, de $3 del $4') : '', bold: true },
            '. Dirige la presente audiencia la señor-a ',
            { text: datos.dirigue || '', bold: true },
            ', miembro de la Junta Cantonal de Protección de Derechos.'
          ],
          margin: [0, 10, 0, 0]
        },
        { text: 'Se constata la presencia de:', margin: [0, 0, 0, 0] },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              [ { text: 'Nombre y cédula persona afectada', bold: true }, nombresCedulasVulnerada ],
              [ { text: 'Nombre y cédula persona denunciado', bold: true }, nombresCedulasVulneradora ],
              [ { text: 'Nombre y cédula persona denunciante', bold: true }, nombresCedulasDenunciante ],
              [ { text: 'Nombre y cédula testigo', bold: true }, nombresCedulasTestigo ]
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        {
          text: [
            'Se realiza la Audiencia reservada establecida en …………………………….. con:'
          ],
          margin: [0, 10, 0, 0]
        },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              ...filaVulnerados
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        { text: 'Se deja constancia de la inasistencia:', margin: [0, 10, 0, 0] },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              ...filaInasistentes
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        { text: 'Presentó / justificó su inasistencia a la audiencia:', margin: [0, 10, 0, 0] },
        {
          table: {
            widths: ['*', '*'],
            body: tablaJustificacion
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        // Instituciones participantes
        { text: 'Instituciones participantes:', margin: [0, 10, 0, 0] },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              ...filaInstituciones
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        // Representantes Proyectos
        { text: 'Representantes Proyectos:', margin: [0, 10, 0, 0] },
        {
          table: {
            widths: ['auto', '*'],
            body: [
              ...filaRepresentantesProyectos
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        // Ratificación
        { text: 'se ratifica en el informe presentado', margin: [0, 10, 0, 0] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [ { text: 'SI', bold: true, fillColor: Number(datos.seRatifica) === 1 ? '#B6D7A8' : undefined } as any,
                { text: 'NO', bold: true, fillColor: Number(datos.seRatifica) === 0 ? '#F4CCCC' : undefined } as any ]
            ]
          },
          layout: 'box',
          margin: [0, 0, 0, 0]
        },
        // Sección narrativa con el campo indica (justo después de ratificación)
        {
          text: [
            'Dejo sentado el contenido del mismo, que en la parte pertinente y fundamental indica: ',
            { text: datos.indica || '' } as any
          ],
          margin: [0, 10, 0, 0]
        },
        // Nuevo párrafo solicitado
        {
          text: 'Después de que puse este informe debo de manifestar lo siguiente:',
          margin: [0, 0, 0, 0]
        },
        {
          text: datos.manifiesta+'.' || '',
          italics: true,
          margin: [0, 0, 0, 0]
        },
        // Iteración de participantes con manifiesta (excluyendo tipo 'afectado')
        ...((datos.participantes || [])
          .filter((p: any) => !(
            p.tipoParticipante && p.tipoParticipante.toLowerCase().includes('afectado')
          ))
          .map((p: any) => ({
            text: [
              'Se concede la palabra a ',
              { text: `${p.nombres} ${p.apellidos}`, bold: true },
              ' quién indica que ',
              { text: p.manifiesta + '.' || '', italics: true }
            ],
            margin: [0, 0, 0, 0]
          }))),
        // Sección de conciliación (si existe)
        ...(datos.conciliacion ? [
          {
            text: 'CONCILIACIÓN',
            style: 'subheader',
            margin: [0, 10, 0, 5]
          },
          {
            text: datos.conciliacion,
            margin: [0, 0, 0, 10]
          }
        ] : []),
        // Bloque narrativo después de los participantes
        {
          text: 'Una vez escuchadas las versiones de las partes, se les pide que abandonen momentáneamente la sala para dar paso a la audiencia reservada con el adolescente',
          margin: [0, 10, 0, 0]
        },
        {
          text: [
            'El niño-a-adolescente manifiesta:',
            '\n',
            { text: datos.afectadoManifiesta || '' }
          ],
          margin: [0, 0, 0, 0]
        },
        {
          text: 'Se solicita que salga el adolescente y se procede con la deliberación de los miembros de la Junta. Transcurrido una hora, la Junta Cantonal de Derechos pide que se convoque a las partes a la sala y se reinicia la Audiencia dando paso a la lectura de la presente acta, dándose lectura a las medidas de protección:',
          margin: [0, 0, 0, 0]
        },
        // Tablas de medidas de protección emergentes por afectado
        ...((datos.medidasEmergentesPorAfectado || [])
          .map((afectado: any) => [
            { text: `Medidas de protección emergentes para: ${afectado.nombres} ${afectado.apellidos}`, style: 'subheader', margin: [0, 10, 0, 5] },
            {
              table: {
                widths: ['*', '*', '*'],
                body: [
                  [
                    { text: 'Medida', bold: true, fillColor: '#E0E0E0' },
                    { text: 'Periodo', bold: true, fillColor: '#E0E0E0' },
                    { text: 'Observaciones', bold: true, fillColor: '#E0E0E0' }
                  ],
                  ...((afectado.medidas|| []).map((medida: any) => [
                    medida.medida || '',
                    medida.periodo || '',
                    medida.observaciones || ''
                  ]))
                ]
              },
              layout: 'box',
              margin: [0, 0, 0, 0]
            }
          ])
        ).flat(),
        // Sección de firmas al final
        {
          text: 'FIRMAS',
          alignment: 'center',
          margin: [0, 30, 0, 10],
          fontSize: 14,
          bold: true
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              stack: (datos.usuariosPrincipalesCanton || []).slice(0, 3).map((u: any) => [
                { text: u.nombres + ' ' + u.apellidos, alignment: 'center', margin: [0, 20, 0, 0] }
              ])
            },
            { width: '*', text: '' }
          ],
          columnGap: 10,
          margin: [0, 40, 0, 0]
        },
  ],
  defaultStyle: {
  fontSize: 12,
  alignment: 'justify',
  lineHeight: 1.5,
  margin: [0, 12, 0, 12]
  },
  styles: {
    header: { fontSize: 18, bold: true },
    subheader: { fontSize: 14, bold: true }
  }
};


    // @ts-ignore
    const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
    pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=audiencia_contestacion.pdf');
      }
      res.send(Buffer.from(buffer));
    });
  } catch (error) {
    console.error('Error al generar el PDF de audiencia contestación:', error);
    if (!res.headersSent) {
      res.status(500).send('Error al generar el PDF de audiencia contestación');
    }
  }
}
