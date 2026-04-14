
import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Si existe DATABASE_URL (en Render), la usa directamente. 
// Si no, usa los parámetros individuales (para Local/Intranet).
const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
					require: true,
					rejectUnauthorized: false
				}
      }
    })
  : new Sequelize(
      process.env.DB_DATABASE || 'postgres',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
        
      }
    );

export default sequelize;
