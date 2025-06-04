import express from 'express';
import { sequelize } from './config/database';
import usuariosRoutes from './routes/usuarios.routes';
import cantonesRoutes from './routes/cantones.routes';
import authRoutes from './routes/auth.routes';
import { Canton } from './models/cantones.models';
import { Usuario } from './models/usuarios.models';

import bcrypt from 'bcryptjs';
import cors from 'cors';



const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/cantones', cantonesRoutes);
app.use('/usuarios', usuariosRoutes);


const cantones = [
  'Portoviejo', 'Bolívar', 'Chone', 'El Carmen', 'Flavio Alfaro', 'Jama',
  'Jaramijó', 'Jipijapa', 'Junín', 'Manta', 'Montecristi', 'Olmedo',
  'Paján', 'Pedernales', 'Pichincha', 'Puerto López', 'Rocafuerte',
  'San Vicente', 'Santa Ana', 'Sucre', 'Tosagua', 'Veinticuatro de Mayo'
];
const adminCorreo = 'admin@example.com';

sequelize.sync({ alter: true }).then(async () => {
  console.log('Base de datos sincronizada');
  const adminExistente = await Usuario.findOne({ where: { correo: adminCorreo } });


  for (const nombre of cantones) {
    await Canton.findOrCreate({ where: { nombre } });
  }
  if (!adminExistente) {
  const contrasena = await bcrypt.hash('admin123', 10);
  await Usuario.create({
    nombres: 'Administrador',
    apellidos: 'Principal',
    correo: adminCorreo,
    user:'admin',
    contrasena,
    rol: 'admin',
    estado: true,
    canton_id: 1, // Asegúrate que exista este ID
    fecha_creacion: new Date()
  });
  console.log('Usuario admin creado automáticamente');
}


  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al conectar la base de datos:', err);
});


/**import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🌐 Bienvenido a tu primera API con Express y TypeScript');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});**/

/**import express from 'express';
import { sequelize } from './config/database';
import usuariosRoutes from './routes/usuarios.routes';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/usuarios', usuariosRoutes);

sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos sincronizada');
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al conectar la base de datos:', err);
});**/


