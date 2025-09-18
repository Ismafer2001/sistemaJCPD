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
import notificacionRoutes from './routes/notificacion.routes';
import citacionRoutes from './routes/citaciones.routes'
import reportedenunciasRoutes from './routes/estadisticas/denunciaReporte.routes'
import pdfRoutes from './routes/pdf.routes'; 
import estatusRoutes from './routes/estatus.routes'; 
import path from 'path';
import audienciaContestacionRoutes from './routes/audienciaContestacion.routes';
import uploadRoutes from './routes/upload.routes';


const app = express();
const PORT = process.env.PORT || 3001;


// Middlewares
app.use(cors()); // Permite todas las conexiones
app.use('/api/upload', uploadRoutes);
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cantones', cantonesRoutes);
app.use('/api/denuncias', denunciasRoutes);
app.use('/api/vulneraciones', vulneracionesRoutes);
app.use('/api/medidas', medidasRoutes);
app.use('/api/avocatoria', avocaroriaRoutes);
app.use('/api/notificacion', notificacionRoutes);
app.use('/api/citacion', citacionRoutes);
app.use('/api/reportes', reportedenunciasRoutes);
app.use('/api/pdf', pdfRoutes); // Ruta para generar PDF de denuncias
app.use('/api/estatus', estatusRoutes)
app.use('/api/audiencia-contestacion', audienciaContestacionRoutes);

app.use('/pdf', express.static(path.join(__dirname, '../public/pdf')));


// Verificar conexión con la base de datos y levantar el servidor
sequelize.sync().then(async () => {

  console.log('✅ Base de datos conectada y modelos sincronizados');
  await seedInitialData(); //  Ejecuta la carga si no hay datos

  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
}).catch((err: any) => {
  console.error('❌ Error al iniciar la base de datos:', err);
});
