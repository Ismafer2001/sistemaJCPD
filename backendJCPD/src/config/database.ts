import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  database: 'sysjcpd', // Cambia por el nombre real de tu base de datos
  username: 'root',        // Cambia por tu usuario de base de datos
  password: '',     // Cambia por tu contraseña real
  host: 'localhost',             // Cambia si usas un host distinto (como una IP externa o Docker)
  dialect: 'mysql',              // Actualizado para usar MySQL
  logging: false,
});