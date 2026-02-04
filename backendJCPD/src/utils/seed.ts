// utils/seed.ts
import { usuarios } from '../models/usuarios.models';
import { Canton } from '../models/cantones.models';
import { Vulneracion } from '../models/vulneraciones.models';
import bcrypt from 'bcryptjs';
import { articulo } from '../models/articulo_medidas.models';
import { medida } from '../models';

export async function seedInitialData() {

  
  const usuariosExistentes = await usuarios.count();
  if (usuariosExistentes > 0) return;

  const cantones = [
    { id: 1, canton: 'Portoviejo' },
      { id: 2, canton: '24 de Mayo' },
      { id: 3, canton: 'Bolívar' },
      { id: 4, canton: 'Chone' },
      { id: 5, canton: 'El Carmen' },
      { id: 6, canton: 'Flavio Alfaro' },
      { id: 7, canton: 'Jama' },
      { id: 8, canton: 'Jaramijó' },
      { id: 9, canton: 'Jipijapa' },
      { id: 10, canton: 'Junín' },
      { id: 11, canton: 'Manta' },
      { id: 12, canton: 'Montecristi' },
      { id: 13, canton: 'Olmedo' },
      { id: 14, canton: 'Paján' },
      { id: 15, canton: 'Pedernales' },
      { id: 16, canton: 'Pichincha' },
      { id: 17, canton: 'Puerto López' },
      { id: 18, canton: 'Rocafuerte' },
      { id: 19, canton: 'San Vicente' },
      { id: 20, canton: 'Santa Ana' },
      { id: 21, canton: 'Sucre' },
      { id: 22, canton: 'Tosagua' }
  ];
  await Canton.bulkCreate(cantones);

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await usuarios.create({
    usuario: 'admin',
    nombres: 'Administrador',
    apellidos: 'Principal',
    correo: 'admin@ejemplo.com',
    contrasena: hashedPassword,
    rol: 'admin',
    isactivo: true,
    id_canton: NaN
  });
      const vulneraciones = [
   { vulneracion: 'Vulneraciones contra el Derecho a la vida (art 20)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a conocer a los progenitores y mantener relaciones con ellos (Art.21)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a tener una familia y a la convivencia familiar (Art 22)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Protección pre natal (Art. 23)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la lactancia (Art. 24)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra la Atención al embarazo y al parto (Art. 25)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a una vida digna (Art. 26)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la salud (Art. 27)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra la Responsabilidad del Estado en relación a este derecho a la salud (Art 28)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra la Obligaciones de los progenitores (Art. 29)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra las Obligaciones de los establecimientos de salud (Art. 30)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a un medio ambiente sano (Art. 32)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la identidad (Art. 33)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la identificación (Art. 34)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra la Normas para la identificación (Art 35)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la educación (Art 37)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra los Objetivos de los programas de educación (Art 38)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra los Derechos y deberes de los progenitores con relación al derecho a la educación (Art. 39)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra la Medidas disciplinarias (Art. 40)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra las sanciones prohibidas (Art. 41)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la educación de los niños, niñas y adolescentes con discapacidad (Art. 42)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la vida cultural (Art. 43)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra los Derechos culturales de los pueblos indígenas y negros o afroecuatorianos (Art. 44)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la información (Art. 45)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra las Prohibiciones relativas al derecho a la información (Art. 46)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra las Garantías de acceso a una información adecuada (Art. 47)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la recreación y al descanso (Art. 48)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra las Normas sobre el acceso a espectáculos públicos (Art. 49)', cuerpoLegal: 'CONNA'},
    { vulneracion: 'Vulneraciones contra el Derecho a la integridad personal (Art. 50)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad personal, dignidad, reputación, honor e imagen (Art. 51)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra las Prohibiciones relacionadas con el derecho a la dignidad e imagen (Art. 52)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la privacidad y a la inviolabilidad del hogar y las formas de comunicación (Art. 53)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la reserva de la información sobre antecedentes penales (Art. 54)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho de los niños, niñas y adolescentes con discapacidades o necesidades especiales (Art. 55)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho de los hijos de las personas privadas de libertad (Art. 55)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a protección especial en casos de desastres y conflictos armados (Art. 56)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho de los niños, niñas y adolescentes refugiados (Art. 57)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad de expresión (Art. 58)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a ser consultados (Art. 59)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad de pensamiento, conciencia y religión (Art. 60)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad de reunión (Art. 62)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Vulneraciones contra el Derecho de libre asociación (Art. 63)', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Maltrato Infantil', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Abuso sexual', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Explotación sexual', cuerpoLegal: 'CONNA' },
    { vulneracion: 'Trafico y perdida', cuerpoLegal: 'CONNA' },
    {
    vulneracion: "Vulneraciones a los beneficios no tributarios Art 13",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al Derecho a las exoneraciones Art 14",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a las Medidas de acción afirmativa Art 15",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra el Derecho a la vida digna Art 16",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al Derecho a la Independencia y autonomía Art 17",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al Derecho a la libertad personal Art 18",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al Derecho a la cultura Art 19",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al deporte, recreación y turismo Art 20",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al trabajo Art 21",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a la capacitación para personas adultas mayores Art 22",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al emprendimiento y financiación Art 23",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a la vivienda adecuada Art 24",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al acceso a la vivienda Art 25",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a la protección en situación de despojo Art 26",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a los alimentos Art 27",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra el pam por parte de los obligados a prestar alimentos Art 28",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra el pam respecto a la situación de las y los alimentantes Art 29",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al pago de la pensión alimenticia Art 30",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones relacionadas con el monto de la pensión alimenticia Art 31",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones respecto a la caducidad del derecho Art 32",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a la seguridad personal Art 33",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra la atención a las víctimas de violencia Art 34",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra el derecho a brindar consentimiento previo, libre e informado Art 35",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra la manifestation del consentimiento Art 36",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a la accesibilidad Art 38",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a la accesibilidad en el transporte público Art 39",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra la accesibilidad en las ciudades Art 40",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra el trato preferente en instituciones Art 41",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones contra el derecho a la salud integral Art 42",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones sobre la importación de medicamentos para el tratamiento de las personas adultas mayores Art 43",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones sobre la prestación de servicios de salud para las personas adultas mayores indigentes Art 44",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al derecho al acceso a los servicios de salud Art 45",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a la atención médica prioritaria en situación de emergencia Art 46",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a los servicios especializados en atención Geriátrica Art 47",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al derecho a la comunicación e información Art 48",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a los contenidos de la información y comunicación Art 49",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al derecho al acceso de las tecnologías de la información y comunicación Art 50",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones al derecho al retorno digno Art 51",
    cuerpoLegal: "LOPAM"
  },
  {
    vulneracion: "Vulneraciones a una vida libre de violencia en el ámbito público y privado, que favorezca su desarrollo y bienestar; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones al respeto de su dignidad, integridad, intimidad, autonomía y a no ser sometida a ninguna forma de discriminación, ni tortura; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a recibir en un contexto de interculturalidad, una educación sustentada en principios de igualdad y equidad; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a recibir información clara, accesible, completa, veraz, oportuna, en castellano o en su idioma propio, adecuada a su edad y contexto socio cultural, incluyendo su salud sexual y reproductiva; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A contar con interpretación, adaptación del lenguaje y comunicación aumentativa, así como apoyo adicional ajustado a sus necesidades; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a que se le garanticen la confidencialidad y la privacidad de sus datos personales, los de sus descendientes o los de cualquier otra persona que esté bajo su tenencia o cuidado; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A recibir protección y atención integral a través de servicios adecuados y eficaces, de manera inmediata y gratuita; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a recibir orientación, asesoramiento, patrocinio jurídico o asistencia consular, de manera gratuita, inmediata, especializada e integral; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a dar su consentimiento informado para los exámenes médico-legales que se practiquen en los casos de violencia sexual; Art 10",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A ser escuchadas en todos los casos personalmente por la autoridad administrativa o judicial competente, y a que su opinión sea considerada; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a recibir un trato sensibilizado, evitando la revictimización, teniendo en cuenta su edad o situación de discapacidad; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a no ser confrontadas, ni ellas ni sus núcleos familiares con los agresores. Prohibición de métodos alternativos de resolución de conflictos; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A la verdad, a la justicia, a la reparación integral y a las garantías de no repetición; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a que se les reconozcan sus derechos laborales, garantice la igualdad salarial entre hombres y mujeres y a evitar el abandono laboral por causas de violencia; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones al auxilio inmediato de la fuerza pública en el momento que las víctimas lo soliciten; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a tener igualdad de oportunidades en el acceso a las funciones públicas y a participar en los asuntos públicos; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A una comunicación y publicidad sin sexismo, violencia y discriminación; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones a una vivienda segura y protegida con derecho a protección preferente; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A que se respete su permanencia o condiciones generales de trabajo, así como sus derechos laborales específicos; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones recibir protección frente a situaciones de amenaza, intimidación o humillaciones; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A no ser explotadas y a recibir protección adecuada en caso de desconocimiento de los beneficios laborales; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones A no ser despedidas o ser sujetos de sanciones laborales por ausencia del trabajo a causa de su condición de víctima; Art 9",
    cuerpoLegal: "LOIPEVCM"
  },
  {
    vulneracion: "Vulneraciones Los demás establecidos en el ordenamiento jurídico vigente; Art 9",
    cuerpoLegal: "LOIPEVCM"
  }
    
  ];

await Vulneracion.bulkCreate(vulneraciones);
const articulos = [
   { articulo: 'CONNA art 59' },
   { articulo: 'CONNA art 217' },
   { articulo: 'LOPAM art 51' },
   { articulo: 'LOIPEVCM art 51' },

    
  ];

await articulo.bulkCreate(articulos);
const medidas = [
   { medidas: 'Allanamiento del lugar donde se encuentre el niño, niña o adolescente, víctima de la práctica ilícita, para su inmediata recuperación. ',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Custodia familiar o acogimiento institucional;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Inserción del niño, niña o adolescente y su familia en un programa de protección y atención;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Concesión de boletas de auxilio a favor del niño, niña o adolescente, ¡en contra de la persona agresora;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Amonestación al agresor;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Inserción del agresor en un programa de atención especializada;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: ' Orden de salida del agresor de la vivienda, ¡si su convivencia con la víctima implica un riesgo para la seguridad física, psicológica o sexual de esta última; y de reingreso de la víctima, si fuere el caso;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Prohibición al agresor de acercarse a la víctima o mantener cualquier tipo de contacto con ella;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Prohibición al agresor de proferir amenazas, en forma directa o indirecta, ¡contra la víctima o sus parientes;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Suspensión del agresor en las tareas o funciones que desempeña;',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Suspensión del funcionamiento de la entidad o establecimiento donde se produjo el maltrato institucional, mientras duren las condiciones que justifican la medid',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Participación del agresor o del personal de la institución en la que se haya producido el maltrato institucional, en talleres, ¡cursos o cualquier modalidad de eventos formativos; y',idArticulo:1, cuerpoLegal: 'CONNA' },
   { medidas: 'Seguimiento por parte de los equipos de trabajo social, para verificar la rectificación de las conductas de maltrato.',idArticulo:1, cuerpoLegal: 'CONNA' },
   //medidas art 217
   { medidas: 'Las acciones de carácter educativo, terapéutico, sicológico o material de apoyo al núcleo familiar, para preservar, fortalecer o restablecer sus vínculos en beneficio del interés del niño, niña o adolescente; ;',idArticulo:2, cuerpoLegal: 'CONNA' },
   { medidas: 'La orden de cuidado del niño, niña o adolescente en su hogar;',idArticulo:2, cuerpoLegal: 'CONNA' },
   { medidas: 'La reinserción familiar o retorno del niño, niña y adolescente a su familia biológica; ',idArticulo:2, cuerpoLegal: 'CONNA' },
   { medidas: 'La custodia de emergencia del niño, niña o adolescente afectado',idArticulo:2, cuerpoLegal: 'CONNA' },
   {
    medidas: "Boleta de auxilio a favor de la persona adulta mayor que se encuentre amenazada o cuyo derecho ha sido vulnerado",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Orden de restricción de acercamiento a la persona adulta mayor, por parte del presunto transgresor de sus derechos, en cualquier espacio público o privado",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Salida inmediata de la o el transgresor de la vivienda de propiedad o a cargo de la persona adulta mayor, cuando su presencia constituya una amenaza para su integridad física, psicológica, sexual o patrimonial",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Restitución de la persona adulta mayor a su domicilio cuando hubiere sido ilegítimamente desalojada o despojada",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Disponer la devolución inmediata de documentos, bienes y valores que ilegalmente le hubieren sido retenidos a la persona adulta mayor",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Prohibir a la o el denunciado acciones de intimidación, amenazas o coacción a la persona adulta mayor, de manera directa o por otra persona",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: " Ordenar la realización del inventario de los bienes muebles e inmuebles de propiedad de las personas adultas mayores, a pedido de éstos, cuando consideren que se trata de perjudicarlos",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Disponer la instalación de dispositivos de alerta, incluido el botón de pánico, en la vivienda de la persona adulta mayor",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Disponer el seguimiento para verificar la rectificación de las conductas de violencia cometidas en contra de personas adultas mayores, por parte de las unidades técnicas respectivas",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Disponer medidas de acogimiento temporal cuando la persona adulta mayor haya sido transgredida en sus derechos y deba salir de la vivienda para proteger su integridad",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "Las demás que sean necesarias para garantizar la debida observancia de los derechos de las personas adultas mayores",
    idArticulo: 3,
    cuerpoLegal: "LOPAM"
  },
  {
    medidas: "a) Emitir la boleta de auxilio y la orden de restricción de acercamiento a la víctima por parte del presunto agresor, en cualquier espacio público o privado",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "b) Ordenar la restitución de la víctima al domicilio habitual, cuando haya sido alejada de este por el hecho violento y así lo solicite",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "c) Ordenar la inserción de la víctima con sus dependientes en un programa de protección con el fin de resguardar su seguridad e integridad",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "d) Prohibir a la persona agresora esconder, trasladar, cambiar la residencia o lugar de domicilio, a sus hijas o hijos o personas dependientes",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "e) Prohibir al agresor por sí o por terceros, acciones de intimidación, amenazas o coacción a la mujer o a cualquier integrante de su familia",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "f) Ordenar al agresor la salida del domicilio cuando su presencia constituya una amenaza para la integridad o la vida de la mujer o su familia",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "g) Ordenar la realización del inventario de los bienes muebles e inmuebles de propiedad común o de posesión legítima de la mujer víctima",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "h) Disponer la instalación de dispositivos de alerta, riesgo o dispositivos electrónicos de alerta, en la vivienda de la mujer víctima",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "i) Disponer la activación de los servicios de protección y atención dispuestos en el Sistema Nacional Integral",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "j) Disponer la inserción de la mujer víctima y sus dependientes en programas de inclusión social y económica, salud, educación y laboral",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "k) Disponer el seguimiento para verificar la rectificación de las conductas de violencia contra las mujeres por parte de las unidades técnicas",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "l) Prohibir a la persona agresora el ocultamiento o retención de bienes o documentos y ordenar la devolución inmediata de los mismos",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "m) Disponer la flexibilidad o reducción del horario de trabajo de las mujeres víctimas de violencia sin afectar sus derechos laborales",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "n) Ordenar la suspensión temporal de actividades que desarrolle el presunto agresor en instituciones deportivas, artísticas o educativas",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  },
  {
    medidas: "o) Todas las que garanticen la integridad de las mujeres en situación de violencia",
    idArticulo: 4,
    cuerpoLegal: "LOIPEVCM"
  }
  ];

await medida.bulkCreate(medidas);



  console.log('✅ Datos iniciales cargados');
}


