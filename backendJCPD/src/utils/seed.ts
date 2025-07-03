// utils/seed.ts
import { Usuario } from '../models/usuarios.models';
import { Canton } from '../models/cantones.models';
import { Vulneracion } from '../models/vulneraciones.models';
import bcrypt from 'bcryptjs';
import { articulo } from '../models/articulo_medidas.models';
import { medida } from '../models';

export async function seedInitialData() {
  
  const usuariosExistentes = await Usuario.count();
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
  await Usuario.create({
    usuario: 'admin',
    nombres: 'Administrador',
    apellidos: 'Principal',
    correo: 'admin@ejemplo.com',
    contrasena: hashedPassword,
    rol: 'admin',
    isactivo: true,
    id_canton: 1,
  });
  const vulneraciones = [
   { vulneracion: 'Vulneraciones contra el Derecho a la vida (art 20)' },
    { vulneracion: 'Vulneraciones contra el Derecho a conocer a los progenitores y mantener relaciones con ellos (Art.21)' },
    { vulneracion: 'Vulneraciones contra el Derecho a tener una familia y a la convivencia familiar (Art 22)' },
    { vulneracion: 'Vulneraciones contra el Protección pre natal (Art. 23)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la lactancia (Art. 24)' },
    { vulneracion: 'Vulneraciones contra la Atención al embarazo y al parto (Art. 25)' },
    { vulneracion: 'Vulneraciones contra el Derecho a una vida digna (Art. 26)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la salud (Art. 27)' },
    { vulneracion: 'Vulneraciones contra la Responsabilidad del Estado en relación a este derecho a la salud (Art 28)' },
    { vulneracion: 'Vulneraciones contra la Obligaciones de los progenitores (Art. 29)' },
    { vulneracion: 'Vulneraciones contra las Obligaciones de los establecimientos de salud (Art. 30)' },
    { vulneracion: 'Vulneraciones contra el Derecho a un medio ambiente sano (Art. 32)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la identidad (Art. 33)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la identificación (Art. 34)' },
    { vulneracion: 'Vulneraciones contra la Normas para la identificación (Art 35)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la educación (Art 37)' },
    { vulneracion: 'Vulneraciones contra los Objetivos de los programas de educación (Art 38)' },
    { vulneracion: 'Vulneraciones contra los Derechos y deberes de los progenitores con relación al derecho a la educación (Art. 39)' },
    { vulneracion: 'Vulneraciones contra la Medidas disciplinarias (Art. 40)' },
    { vulneracion: 'Vulneraciones contra las sanciones prohibidas (Art. 41)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la educación de los niños, niñas y adolescentes con discapacidad (Art. 42)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la vida cultural (Art. 43)' },
    { vulneracion: 'Vulneraciones contra los Derechos culturales de los pueblos indígenas y negros o afroecuatorianos (Art. 44)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la información (Art. 45)' },
    { vulneracion: 'Vulneraciones contra las Prohibiciones relativas al derecho a la información (Art. 46)' },
    { vulneracion: 'Vulneraciones contra las Garantías de acceso a una información adecuada (Art. 47)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la recreación y al descanso (Art. 48)' },
    { vulneracion: 'Vulneraciones contra las Normas sobre el acceso a espectáculos públicos (Art. 49)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la integridad personal (Art. 50)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad personal, dignidad, reputación, honor e imagen (Art. 51)' },
    { vulneracion: 'Vulneraciones contra las Prohibiciones relacionadas con el derecho a la dignidad e imagen (Art. 52)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la privacidad y a la inviolabilidad del hogar y las formas de comunicación (Art. 53)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la reserva de la información sobre antecedentes penales (Art. 54)' },
    { vulneracion: 'Vulneraciones contra el Derecho de los niños, niñas y adolescentes con discapacidades o necesidades especiales (Art. 55)' },
    { vulneracion: 'Vulneraciones contra el Derecho de los hijos de las personas privadas de libertad (Art. 55)' },
    { vulneracion: 'Vulneraciones contra el Derecho a protección especial en casos de desastres y conflictos armados (Art. 56)' },
    { vulneracion: 'Vulneraciones contra el Derecho de los niños, niñas y adolescentes refugiados (Art. 57)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad de expresión (Art. 58)' },
    { vulneracion: 'Vulneraciones contra el Derecho a ser consultados (Art. 59)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad de pensamiento, conciencia y religión (Art. 60)' },
    { vulneracion: 'Vulneraciones contra el Derecho a la libertad de reunión (Art. 62)' },
    { vulneracion: 'Vulneraciones contra el Derecho de libre asociación (Art. 63)' },
    { vulneracion: 'Maltrato Infantil' },
    { vulneracion: 'Abuso sexual' },
    { vulneracion: 'Explotación sexual' },
    { vulneracion: 'Trafico y perdida' }
  ];

await Vulneracion.bulkCreate(vulneraciones);
const articulos = [
   { articulo: 'CONNA art 59' },
   { articulo: 'CONNA art 217' }
    
  ];

await articulo.bulkCreate(articulos);
const medidas = [
   { medidas: 'Allanamiento del lugar donde se encuentre el niño, niña o adolescente, víctima de la práctica ilícita, para su inmediata recuperación. ',idArticulo:1 },
   { medidas: 'Custodia familiar o acogimiento institucional;',idArticulo:1 },
   { medidas: 'Inserción del niño, niña o adolescente y su familia en un programa de protección y atención;',idArticulo:1 },
   { medidas: 'Concesión de boletas de auxilio a favor del niño, niña o adolescente, ¡en contra de la persona agresora;',idArticulo:1 },
   { medidas: 'Amonestación al agresor;',idArticulo:1 },
   { medidas: 'Inserción del agresor en un programa de atención especializada;',idArticulo:1 },
   { medidas: ' Orden de salida del agresor de la vivienda, ¡si su convivencia con la víctima implica un riesgo para la seguridad física, psicológica o sexual de esta última; y de reingreso de la víctima, si fuere el caso;',idArticulo:1 },
   { medidas: 'Prohibición al agresor de acercarse a la víctima o mantener cualquier tipo de contacto con ella;',idArticulo:1 },
   { medidas: 'Prohibición al agresor de proferir amenazas, en forma directa o indirecta, ¡contra la víctima o sus parientes;',idArticulo:1 },
   { medidas: 'Suspensión del agresor en las tareas o funciones que desempeña;',idArticulo:1 },
   { medidas: 'Suspensión del funcionamiento de la entidad o establecimiento donde se produjo el maltrato institucional, mientras duren las condiciones que justifican la medid',idArticulo:1 },
   { medidas: 'Participación del agresor o del personal de la institución en la que se haya producido el maltrato institucional, en talleres, ¡cursos o cualquier modalidad de eventos formativos; y',idArticulo:1 },
   { medidas: 'Seguimiento por parte de los equipos de trabajo social, para verificar la rectificación de las conductas de maltrato.',idArticulo:1 },
   //medidas art 217
   { medidas: 'Las acciones de carácter educativo, terapéutico, sicológico o material de apoyo al núcleo familiar, para preservar, fortalecer o restablecer sus vínculos en beneficio del interés del niño, niña o adolescente; ;',idArticulo:2 },
   { medidas: 'La orden de cuidado del niño, niña o adolescente en su hogar;',idArticulo:2 },
   { medidas: 'La reinserción familiar o retorno del niño, niña y adolescente a su familia biológica; ',idArticulo:2 },
   { medidas: 'La custodia de emergencia del niño, niña o adolescente afectado',idArticulo:2 },
  ];

await medida.bulkCreate(medidas);


  console.log('✅ Datos iniciales cargados');
}


