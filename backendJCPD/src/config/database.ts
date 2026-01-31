
import { Sequelize } from 'sequelize';
import 'dotenv/config';


const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD,
   
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false
				}
			},
    logging: false,
  }
);

export default sequelize;
