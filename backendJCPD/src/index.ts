import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models'; // Conecta y carga modelos
import authRoutes from './routes/auth.routes';
import usuarioRoutes from './routes/usuarios.routes';
import cantonesRoutes from './routes/cantones.routes';
import denunciasRoutes from './routes/denuncias.routes';

import { seedInitialData } from './utils/seed';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permite todas las conexiones
// Middlewares
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cantones', cantonesRoutes);
app.use('/api/denuncias', denunciasRoutes);

// Verificar conexión con la base de datos y levantar el servidor
sequelize.sync({force: true}).then(async () => {
  
  console.log('✅ Base de datos conectada y modelos sincronizados');
  await seedInitialData(); // 👈 Ejecuta la carga si no hay datos

  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}).catch((err: any) => {
  console.error('❌ Error al iniciar la base de datos:', err);
});