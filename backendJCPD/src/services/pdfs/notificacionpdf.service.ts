import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const PDFnotificacion = async (notificacion:any) => {
  return new Promise<string>((resolve, reject) => {
    const filename = `notificacion_${notificacion.codigoTramite}.pdf`;
    const filePath = path.join(__dirname, '../../public/pdf', filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(12).text('FORMATO DE NOTIFICACION', { align: 'center' });
    doc.moveDown();
    doc.text(`Trámite Administrativo N° ${notificacion.codigoTramite}`);
    doc.text(`${notificacion.fecha}`);
    doc.text(`Oficio N° ${notificacion.oficio}`);
    doc.moveDown();
    doc.font('Helvetica-Bold').text('NOTIFICACIÓN');
    doc.moveDown();
    doc.text('Señora');
    doc.text(notificacion.diriguidoA);
    doc.text(`PARTE ${notificacion.parte}`);
    doc.text('Ciudad.');
    doc.moveDown();
    doc.font('Helvetica').text('De nuestras consideraciones:', { underline: true });
    doc.moveDown();
    doc.text(`Reciban un cordial saludo de quienes conformamos la Junta de Protección del cantón ${notificacion.canton}.`);
    doc.moveDown();
    doc.text(`Adjunto a la presente sírvase encontrar la Avocatoria de fecha ${notificacion.avocatoriaFecha}, en donde encontrará las medidas de protección dispuestas a su favor dentro del trámite administrativo N° ${notificacion.tramite}.`);
    doc.moveDown();
    doc.text('Sin otro particular suscribimos.');
    doc.moveDown();
    doc.text('Atentamente,');
    doc.moveDown().moveDown();
    doc.font('Helvetica-Bold').text('MIEMBROS DE LA JUNTA CANTONAL DE PROTECCION DE DERECHOS');
    doc.moveDown().moveDown();
    doc.text('RECIBIDO: ____________________________________________');
    doc.text('FECHA: _______________');
    doc.text('DIRECCIÓN: ____________________________________________');
    doc.moveDown();
    doc.text('NOTA: Se adjunta Avocatoria de Conocimiento, medidas de protección y boleta de auxilio');

    doc.end();

    stream.on('finish', () => resolve(`/pdf/${filename}`)); // URL accesible
    stream.on('error', (err) => reject(err));
  });
};
