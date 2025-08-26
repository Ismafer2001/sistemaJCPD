// src/services/pdf/proteccionFormPdf.service.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateProteccionFormPDF = (res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

  // Headers para que se descargue
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=formulario_proteccion.pdf');

  doc.pipe(res);

  // ✅ Aquí empieza el contenido del PDF
  doc.fontSize(12).text(
    'SEÑORES MIEMBROS PRINCIPALES DE LA JUNTA CANTONAL DE PROTECCIÓN DE DERECHOS',
    { align: 'center' }
  );

  doc.moveDown();
  doc.fontSize(11).text('1. DATOS DEL O LA DENUNCIANTE', { underline: true });

  const fields = [
    'NOMBRES', 'APELLIDOS', 'EDAD', 'SEXO', 'GENERO',
    'NACIONALIDAD', 'PUEBLO/NACIONALIDAD', 'DIRECCION', 'MAIL', 'TELEFONO'
  ];

  let y = doc.y + 10;
  const startX = 50;
  const fieldWidth = 250;
  const valueWidth = 300;
  const rowHeight = 25;

  fields.forEach((field) => {
    doc.rect(startX, y, fieldWidth, rowHeight).stroke();
    doc.text(field, startX + 5, y + 8);

    doc.rect(startX + fieldWidth, y, valueWidth, rowHeight).stroke();
    y += rowHeight;
  });

  // Sección 2
  doc.moveDown().moveDown();
  doc.fontSize(11).text('2. DATOS DE PERSONAS (20) EN SITUACION DE VULNERACION O RIESGO:', { underline: true });

  y = doc.y + 10;
  fields.forEach((field) => {
    doc.rect(startX, y, fieldWidth, rowHeight).stroke();
    doc.text(field, startX + 5, y + 8);

    doc.rect(startX + fieldWidth, y, valueWidth, rowHeight).stroke();
    y += rowHeight;
  });
  // Sección 6 - Datos del denunciado(a)
doc.addPage(); // Opcional: nueva página si querés separar visualmente

doc.moveDown().moveDown();
doc.fontSize(11).text('6. DATOS DEL O LA DENUNCIADO (A):', { underline: true });

y = doc.y + 10;

const denunciadoFields = [
  'NOMBRES', 'APELLIDOS', 'EDAD', 'SEXO', 'GENERO',
  'NACIONALIDAD', 'PUEBLO/NACIONALIDAD', 'DIRECCION', 'MAIL', 'TELEFONO','PARENTEZCO'
];

// Mismos tamaños que antes
denunciadoFields.forEach((field) => {
  doc.rect(startX, y, fieldWidth, rowHeight).stroke();
  doc.text(field, startX + 5, y + 8);

  doc.rect(startX + fieldWidth, y, valueWidth, rowHeight).stroke();
  y += rowHeight;
});



y += rowHeight;
doc.moveDown().moveDown();
doc.fontSize(11).text('7. SOBRE EL HECHO:', { underline: true });

y = doc.y + 10;
doc.rect(startX, y, fieldWidth, rowHeight * 2).stroke();
doc.text('DESCRIPCION DE LOS HECHOS', startX + 5, y + 8);

doc.rect(startX + fieldWidth, y, valueWidth, rowHeight * 2).stroke();
doc.text('(TABLAS DE VULNERACIONES POR SUJETO DE DERECHOS CON OPCIONES DE ESCOGITAMIENTO)', startX + fieldWidth + 5, y + 8, {
  width: valueWidth - 10
});

y += rowHeight * 2;

doc.rect(startX, y, fieldWidth, rowHeight).stroke();
doc.text('CORRESPONDE A VULNERACION DEL', startX + 5, y + 8);

doc.rect(startX + fieldWidth, y, valueWidth, rowHeight).stroke();

// Sección 8 - Medidas de protección
doc.moveDown().moveDown();
doc.fontSize(11).text('8. MEDIDAS DE PROTECCION:', { underline: true });

y = doc.y + 10;
doc.rect(startX, y, fieldWidth, rowHeight * 2).stroke();
doc.text('SOLICITUD', startX + 5, y + 8);

doc.rect(startX + fieldWidth, y, valueWidth, rowHeight * 2).stroke();
doc.text('(TABLAS DE MEDIDAS DE PROTECCION POR SUJETO DE DERECHOS CON OPCIONES DE ESCOGITAMIENTO)', startX + fieldWidth + 5, y + 8, {
  width: valueWidth - 10
});

y += rowHeight * 2;

// Frase final
doc.moveDown();
doc.fontSize(12).text('Es Justicia, etc.', { align: 'left' });

doc.moveDown().moveDown();

// Línea para firma
const firmaY = doc.y;
doc.moveTo(startX, firmaY).lineTo(startX + 300, firmaY).stroke();

doc.text(
  'Firma del denunciante (en caso que el denunciante lo haga por cualquier otro medio digital, la JCPD deberá sentar una razón en la denuncia y continúa el trámite)',
  startX,
  firmaY + 10,
  { width: 500 }
);

doc.moveDown();
doc.text('C.C.', { align: 'left' });


  // ✅ Finaliza y cierra
  doc.end();
};
