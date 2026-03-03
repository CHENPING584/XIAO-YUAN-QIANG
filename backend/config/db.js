const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'campus_wall',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 增加 SSL 支持，云数据库（如 TiDB, PlanetScale, Azure）通常需要
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

module.exports = pool.promise();
