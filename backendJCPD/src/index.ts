import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import  sequelize  from './config/database'; // Conecta y carga modelos
import authRoutes from './routes/auth.routes';
import usuarioRoutes from './routes/usuarios.routes';
import cantonesRoutes from './routes/cantones.routes';
import denunciasRoutes from './routes/denuncias.routes';
import vulneracionesRoutes from './routes/vulneraciones.routes'
import medidasRoutes from './routes/medidas.routes';
import avocaroriaRoutes from './routes/avocatoria.routes';
import { seedInitialData } from './utils/seed';


const app = express();
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors()); // Permite todas las conexiones
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cantones', cantonesRoutes);
app.use('/api/denuncias', denunciasRoutes);
app.use('/api/vulneraciones', vulneracionesRoutes);
app.use('/api/medidas', medidasRoutes);
app.use('/api/avocatoria', avocaroriaRoutes);

// Verificar conexión con la base de datos y levantar el servidor
sequelize.sync().then(async () => {
  
  console.log('✅ Base de datos conectada y modelos sincronizados');
  await seedInitialData(); // 👈 Ejecuta la carga si no hay datos

  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}).catch((err: any) => {
  console.error('❌ Error al iniciar la base de datos:', err);
});